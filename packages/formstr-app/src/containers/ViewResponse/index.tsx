import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Event, getPublicKey, nip19 } from "nostr-tools";
import { EventPointer } from "nostr-tools/nip19";
import { hexToBytes } from "nostr-tools/utils";
import { useTranslation } from "react-i18next";

import { ROUTES } from "../../constants/routes";
import { useProfileContext } from "../../hooks/useProfileContext";
import { fetchOne } from "../../dataLayer";
import { subscribeFormTemplate } from "../../nostr/fetchFormTemplate";
import {
  fetchKeys,
  getFormSpec,
  getformstrBranding,
} from "../../utils/formUtils";
import {
  buildResponseFormValues,
  getInputsFromResponseEvent,
  getResponseLabels,
} from "../../utils/ResponseUtils";
import { decodeNKeys } from "../../utils/nkeys";
import { Tag } from "../../nostr/types";
import { FormRenderer } from "../FormFillerNew/FormRenderer";

type Status =
  | "loading"
  | "notFound"
  | "accessDenied"
  | "decryptFailed"
  | "ready";

/**
 * Standalone, shareable single-response viewer mounted at /view/:nevent.
 *
 * The `nevent` (built by `buildResponsePermalink`) points at the kind-1069
 * response and carries its relays + responder pubkey. The form author + form id
 * are recovered from the 1069's `a` tag (`30168:<authorPub>:<formId>`), so the
 * form template can be fetched for question labels.
 *
 * Decryption depends on who is opening the link:
 *  - ANONYMOUS submissions: the permalink embeds the responder's ephemeral
 *    secret in the URL hash (`nkeys`). NIP-44 v2 is symmetric, so
 *    ECDH(responderSecret, formAuthorPub) reproduces the conversation key the
 *    responder used. `editKey` = responder secret, `otherPubkey` = form author.
 *  - FORM AUTHOR (logged in): fetches the per-form EditAccess key and decrypts
 *    with ECDH(editKey, responderPub) — the default `getInputsFromResponseEvent`
 *    path used by the responses screen.
 *  - Anyone, if the response is unencrypted (content === "").
 *
 * If the FORM itself is encrypted and no view key is available, question labels
 * can't be recovered; answers still render with their raw field IDs.
 */
export const ViewResponse: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { nevent } = useParams();

  const { pubkey: userPubKey } = useProfileContext();
  const [status, setStatus] = useState<Status>("loading");
  const [responseEvent, setResponseEvent] = useState<Event | null>(null);
  const [formEvent, setFormEvent] = useState<Event | undefined>(undefined);
  const [formSpec, setFormSpec] = useState<Tag[] | null | undefined>(undefined);
  const [inputs, setInputs] = useState<Tag[] | null>(null);
  const [editKey, setEditKey] = useState<string | undefined>(undefined);

  // Responder ephemeral secret (anonymous submissions) from the #nkeys hash.
  const responderSecretHex = (() => {
    if (typeof window === "undefined") return undefined;
    const rawHash = window.location.hash.replace(/^#/, "");
    if (!rawHash.startsWith("nkeys")) return undefined;
    try {
      return decodeNKeys(rawHash).secretKey;
    } catch {
      return undefined;
    }
  })();

  // Optional ?viewKey= (form view access) for decrypting an encrypted form.
  const viewKeyParam = (() => {
    if (typeof window === "undefined") return undefined;
    return (
      new URLSearchParams(window.location.search).get("viewKey") ?? undefined
    );
  })();

  let decoded: EventPointer | undefined;
  if (nevent) {
    try {
      decoded = nip19.decode(nevent).data as EventPointer;
    } catch {
      decoded = undefined;
    }
  }

  const responseId = decoded?.id;
  const responseRelays = decoded?.relays;

  // 1. Fetch the kind-1069 response by id.
  useEffect(() => {
    if (!responseId) {
      setStatus("notFound");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchOne([{ ids: [responseId], kinds: [1069] }], responseRelays).then(
      (event) => {
        if (cancelled) return;
        if (!event) {
          setStatus("notFound");
          return;
        }
        setResponseEvent(event);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [responseId, responseRelays?.join(",")]);

  // 2. From the 1069's `a` tag, recover the form author + id and subscribe to
  //    the form template (kind 30168) for question labels.
  const aTag = responseEvent?.tags.find((tg) => tg[0] === "a")?.[1];
  const [formKind, formAuthorPub, formId] = aTag?.split(":") ?? [];

  useEffect(() => {
    if (!responseEvent || !formAuthorPub || !formId || formKind !== "30168")
      return;
    let cancelled = false;
    const sub = subscribeFormTemplate(
      formAuthorPub,
      formId,
      (event: Event) => {
        if (cancelled) return;
        setFormEvent((prev) => (prev && prev.id === event.id ? prev : event));
      },
      responseRelays,
    );
    return () => {
      cancelled = true;
      sub.close();
    };
  }, [responseEvent?.id, formAuthorPub, formId]);

  // 3. Once we have both the response and the form, resolve the edit key + the
  //    ECDH counterparty, decrypt the response, and decode the form spec.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!responseEvent || !formAuthorPub || !formId || !formEvent) return;

      // --- Decrypt the RESPONSE content ---
      let resolvedEditKey: string | undefined;
      let otherPubkey: string | undefined;

      if (responderSecretHex) {
        // Anonymous responder viewing their own response.
        resolvedEditKey = responderSecretHex;
        otherPubkey = formAuthorPub;
      } else if (responseEvent.content === "") {
        // Unencrypted response — no key needed.
      } else if (userPubKey) {
        // Form author (or a viewer with access) logged in.
        const keys = await fetchKeys(formAuthorPub, formId, userPubKey);
        resolvedEditKey = keys?.find((k) => k[0] === "EditAccess")?.[1];
      } else if (viewKeyParam) {
        // Form view key (pubkey matches the form author) — last resort.
        resolvedEditKey = viewKeyParam;
      }

      const responseNeedsKey = responseEvent.content !== "";
      if (responseNeedsKey && !resolvedEditKey) {
        if (!cancelled) setStatus("accessDenied");
        return;
      }

      const parsedInputs = getInputsFromResponseEvent(
        responseEvent,
        resolvedEditKey,
        otherPubkey,
      );
      if (responseNeedsKey && parsedInputs.length === 0) {
        if (!cancelled) setStatus("decryptFailed");
        return;
      }
      if (!cancelled) {
        setInputs(parsedInputs);
        setEditKey(resolvedEditKey);
      }

      // --- Decode the FORM spec (for question labels) ---
      try {
        const spec = await getFormSpec(
          formEvent,
          userPubKey,
          null,
          viewKeyParam,
        );
        if (!cancelled) setFormSpec(spec);
      } catch {
        if (!cancelled) setFormSpec(null);
      }

      if (!cancelled) setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [responseEvent?.id, formEvent?.id, userPubKey, viewKeyParam]);

  if (!nevent || !decoded) {
    return (
      <ViewerShell>
        <Typography>{t("common.labels.invalidUrl")}</Typography>
      </ViewerShell>
    );
  }

  if (status === "loading") {
    return (
      <ViewerShell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">
            {t("responses.viewer.loading")}
          </Typography>
        </Box>
      </ViewerShell>
    );
  }

  if (status === "notFound") {
    return (
      <ViewerShell>
        <Typography sx={{ mb: 2 }}>{t("responses.viewer.notFound")}</Typography>
        <BackButton
          onClick={() => navigate(ROUTES.DASHBOARD)}
          label={t("responses.viewer.backToDashboard")}
        />
      </ViewerShell>
    );
  }

  if (status === "accessDenied") {
    return (
      <ViewerShell>
        <Typography sx={{ mb: 2 }}>
          {t("responses.viewer.accessDenied")}
        </Typography>
        <BackButton
          onClick={() => navigate(ROUTES.DASHBOARD)}
          label={t("responses.viewer.backToDashboard")}
        />
      </ViewerShell>
    );
  }

  if (status === "decryptFailed") {
    return (
      <ViewerShell>
        <Typography sx={{ mb: 2 }}>
          {t("responses.viewer.decryptFailed")}
        </Typography>
        <BackButton
          onClick={() => navigate(ROUTES.DASHBOARD)}
          label={t("responses.viewer.backToDashboard")}
        />
      </ViewerShell>
    );
  }

  // ready (formSpec may be null for encrypted forms without a view key —
  // answers still render with raw field IDs).
  const formTemplate = formSpec ?? [];
  const branding = getformstrBranding(formSpec);
  const formAuthorPubkeyForRenderer = editKey
    ? getPublicKey(hexToBytes(editKey))
    : formAuthorPub;

  // Degraded rendering: the form is encrypted and we have no view key, so
  // question labels are unavailable. The response itself is still decrypted, so
  // fall back to a plain question/answer list keyed by field id.
  const degradedAnswers =
    formSpec === null
      ? (inputs ?? []).map((tag) => getResponseLabels(tag, []))
      : [];

  return (
    <ViewerShell title={t("responses.viewer.title")}>
      {formSpec === null && (
        <Typography
          color="text.secondary"
          sx={{ fontSize: 12, mb: 1, fontStyle: "italic" }}
        >
          {t("responses.viewer.degradedLabelsNote")}
        </Typography>
      )}
      {formTemplate.length > 0 ? (
        <FormRenderer
          formTemplate={formTemplate}
          onInput={() => undefined}
          disabled={true}
          readOnly={true}
          initialValues={buildResponseFormValues(inputs ?? [])}
          formstrBranding={branding}
          formAuthorPubkey={formAuthorPubkeyForRenderer}
          formEditKey={editKey}
          uploaderPubkey={responseEvent?.pubkey}
        />
      ) : formSpec === null ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {degradedAnswers.length === 0 ? (
            <Typography color="text.secondary">
              {t("responses.detail.waiting")}
            </Typography>
          ) : (
            degradedAnswers.map((a) => (
              <Box
                key={a.fieldId}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  pb: 1,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {a.questionLabel}
                </Typography>
                <Typography sx={{ fontSize: 14, whiteSpace: "pre-wrap" }}>
                  {a.responseLabel}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">
            {t("responses.detail.waiting")}
          </Typography>
        </Box>
      )}
    </ViewerShell>
  );
};

const ViewerShell: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <Box
    sx={{
      maxWidth: 760,
      mx: "auto",
      px: 2,
      py: 4,
      display: "flex",
      flexDirection: "column",
    }}
  >
    {title && (
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const BackButton: React.FC<{ onClick: () => void; label: string }> = ({
  onClick,
  label,
}) => (
  <Button variant="outlined" onClick={onClick}>
    {label}
  </Button>
);
