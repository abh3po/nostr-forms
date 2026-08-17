import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useState } from "react";
import { sendNRPCWebhook, sendResponses } from "../../../nostr/common";
import { RelayPublishModal } from "../../../components/RelayPublishModal/RelaysPublishModal";
import { Event } from "nostr-tools";
import { Response, Tag } from "../../../nostr/types";
import { getFormSettings } from "./utils";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { useTranslation } from "react-i18next";
import { recordSubmission } from "../../../utils/submissions";
import {
  buildAndSignZapRequest,
  fetchZapInvoice,
  formACoord,
  getZapEndpointFromLud16,
} from "../../../nostr/zap";
import { buildResponsePermalink } from "../../../utils/responsePermalink";
import type { ResponseSubmitMeta } from "../../../utils/responsePermalink";
import { ZapPayModal } from "./ZapPayModal";

type PayState = "idle" | "paying" | "awaitingPayment" | "paid";

interface SubmitButtonProps {
  selfSign: boolean | undefined;
  edit: boolean;
  /** Runs required/rule validation over every field; true when the form is valid. */
  validateForm: () => boolean;
  /** Builds the response tags from the current answers. */
  getResponses: () => Response[];
  formEvent: Event;
  onSubmit: (meta?: ResponseSubmitMeta) => Promise<void>;
  disabled?: boolean;
  disabledMessage?: string;
  relays: string[];
  formTemplate: Tag[];
  responderSecretKey?: Uint8Array; // Use this for anonymous submissions, undefined for non-anonymous
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  selfSign,
  edit,
  validateForm,
  getResponses,
  onSubmit,
  formEvent,
  disabled = false,
  disabledMessage,
  relays,
  formTemplate,
  responderSecretKey,
}) => {
  const { t } = useTranslation();
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [acceptedRelays, setAcceptedRelays] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [isValidated, setIsValidated] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // --- Zap-gated (paid) form state ---
  const [payState, setPayState] = useState<PayState>("idle");
  const [payError, setPayError] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<{
    bolt11: string;
    hash: string;
    amountMsats: number;
  } | null>(null);
  const [payReceiptWatch, setPayReceiptWatch] = useState<{
    formACoord: string;
    responseId: string;
    authorPubkey: string;
    requiredMsats: number;
    relays: string[];
    lud16: string;
    contact?: string;
  } | null>(null);
  const [payMeta, setPayMeta] = useState<ResponseSubmitMeta | null>(null);

  // --- Helpers ---
  const fireWebhook = async (
    formTemplate: Tag[],
    responses: Response[],
    anonUser?: Uint8Array,
  ) => {
    const relays = formEvent.tags
      .filter((value: Tag) => value[0] === "relay")
      .map((t) => t[1]);
    return await sendNRPCWebhook(formTemplate, responses, relays, anonUser);
  };

  // --- Main ---
  const saveResponse = async (anonymous: boolean) => {
    let formId = formEvent.tags.find((t) => t[0] === "d")?.[1];
    if (!formId) {
      alert(t("filler.submit.formIdNotFound"));
      return;
    }

    const pubKey = formEvent.pubkey;
    const responses = getResponses();
    // Use the responderSecretKey passed from FormRendererContainer (same key used for file encryption)
    const anonUser = anonymous ? responderSecretKey : null;

    setIsSubmitting(true);
    const { event: responseEvent, acceptedRelays: accepted } =
      await sendResponses(
        pubKey,
        formId!,
        responses,
        anonUser,
        true,
        relays,
        (url: string) => setAcceptedRelays((prev) => [...prev, url]),
      );
    setIsSubmitting(false);
    const meta =
      responseEvent
        ? buildResponsePermalink(
            responseEvent,
            accepted.length ? accepted : relays,
            anonymous ? responderSecretKey ?? null : null,
          )
        : null;
    recordSubmission({
      formId: formId!,
      formPubkey: pubKey,
      formName: formTemplate.find((t) => t[0] === "name")?.[1] || formId!,
      relays,
      submittedAt: new Date().toISOString(),
      anonymous,
      submittedAs: anonymous ? undefined : userPubKey || undefined,
      responseEventId: meta?.responseEventId,
      nevent: meta?.nevent,
      permalink: meta?.permalink,
    });
    onSubmit(meta ?? undefined);
  };

  // --- Webhook Validation ---
  const validateWebhook = async () => {
    setErrorMessage(null);
    setValidationMessage(null);

    try {
      if (!validateForm()) return;
      setIsValidating(true);
      const responses = getResponses();
      // Use responderSecretKey for validation too
      const nrpcResponse = await fireWebhook(
        formTemplate,
        responses,
        responderSecretKey,
      );
      setIsValidating(false);

      if (!nrpcResponse) {
        setErrorMessage(t("filler.submit.noWebhookResponse"));
        return;
      }

      const status = nrpcResponse.tags.find((t) => t[0] === "status")?.[1];
      if (status === "200") {
        setIsValidated(true);
        setValidationMessage(t("filler.submit.validationSuccess"));
      } else {
        const errorTags = nrpcResponse.tags.filter((t) => t[0] === "error");
        const msg =
          errorTags.map((tag: string[]) => tag[2]).join(", ") ||
          t("filler.submit.validationFailedStatus", { status });
        setErrorMessage(msg);
        setIsValidated(false);
      }
    } catch (err) {
      setIsValidating(false);
      console.log("Error during validation", err);
      setErrorMessage(t("filler.submit.validationFailed"));
    }
  };

  const submitForm = async (anonymous: boolean = true) => {
    setErrorMessage(null);

    // Check if user is logged in when attempting non-anonymous submission
    if (!anonymous && !userPubKey) {
      setErrorMessage(t("filler.submit.loginToSubmit"));
      void requestPubkey().then((pubkey) => {
        if (pubkey) {
          setErrorMessage(null);
        }
      });
      return;
    }

    try {
      if (validateForm()) {
        setIsDisabled(true);

        const responses = getResponses();
        // Use the responderSecretKey for anonymous (same as file encryption)
        const anonUser = anonymous ? responderSecretKey : null;

        if (requireWebhookPass) {
          // When webhook is required, we already validated before
          await saveResponse(anonymous);
        } else {
          // Fire-and-forget webhook after saving
          await saveResponse(anonymous);
          fireWebhook(formTemplate, responses, anonUser || undefined);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setIsDisabled(false);
      console.log("Error in sending response", err);
    }
  };

  // --- Zap-gated (paid) flow ---
  const attemptWebLN = async (pr: string): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !(window as any).webln) return false;
      await (window as any).webln.enable();
      const response = await (window as any).webln.sendPayment(pr);
      return !!response?.preimage;
    } catch (err) {
      console.log("WebLN payment failed/declined", err);
      return false;
    }
  };

  const handlePay = async (anonymous: boolean) => {
    setPayError(null);
    if (!anonymous && !userPubKey) {
      setPayError(t("filler.submit.loginToSubmit"));
      void requestPubkey().then((pubkey) => {
        if (pubkey) setPayError(null);
      });
      return;
    }
    if (!validateForm()) return;

    const formId = formEvent.tags.find((t) => t[0] === "d")?.[1];
    if (!formId) {
      setPayError(t("filler.submit.formIdNotFound"));
      return;
    }
    const pubKey = formEvent.pubkey;
    const responses = getResponses();
    const anonUser = anonymous ? responderSecretKey : null;
    const signKey = anonymous ? responderSecretKey ?? null : null;

    setPayState("paying");
    setIsSubmitting(true);
    // Publish the response fire-and-forget; capture the signed event so the
    // zap request can reference its id (form first, response second).
    const { event: responseEvent, acceptedRelays: accepted } =
      await sendResponses(
        pubKey,
        formId,
        responses,
        anonUser,
        true,
        relays,
        (url: string) => setAcceptedRelays((prev) => [...prev, url]),
      );
    setIsSubmitting(false);
    if (!responseEvent) {
      setPayError(t("filler.submit.pay.noResponseEvent"));
      setPayState("idle");
      return;
    }

    const requiredMsats = (settings?.paymentAmountSats ?? 0) * 1000;
    const lud16 = settings?.paymentLud16 ?? "";
    const contact = settings?.contact;

    const zapEndpoint = await getZapEndpointFromLud16(lud16);
    if (!zapEndpoint) {
      setPayError(t("filler.submit.pay.resolveLud16Failed"));
      setPayState("idle");
      return;
    }

    const aCoord = formACoord(pubKey, formId);
    const zapRelays = accepted.length ? accepted : relays;

    let zapReq: Event;
    try {
      zapReq = await buildAndSignZapRequest(
        {
          recipientPubkey: pubKey,
          amountMsats: requiredMsats,
          relays: zapRelays,
          formACoord: aCoord,
          responseEventId: responseEvent.id,
        },
        signKey,
      );
    } catch (err) {
      console.log("Zap request signing failed", err);
      setPayError(t("filler.submit.pay.payFailed"));
      setPayState("idle");
      return;
    }

    let invoice: { bolt11: string; hash: string; amountMsats: number };
    try {
      invoice = await fetchZapInvoice({
        zapEndpoint,
        signedZapRequestEvent: zapReq,
        amountMsats: requiredMsats,
      });
    } catch (err) {
      console.log("Invoice fetch failed", err);
      setPayError(t("filler.submit.pay.invoiceFailed"));
      setPayState("idle");
      return;
    }

    const meta = buildResponsePermalink(
      responseEvent,
      zapRelays,
      anonymous ? responderSecretKey ?? null : null,
    );
    setPayMeta(meta);
    recordSubmission({
      formId,
      formPubkey: pubKey,
      formName: formTemplate.find((t) => t[0] === "name")?.[1] || formId,
      relays,
      submittedAt: new Date().toISOString(),
      anonymous,
      submittedAs: anonymous ? undefined : userPubKey || undefined,
      responseEventId: meta.responseEventId,
      nevent: meta.nevent,
      permalink: meta.permalink,
    });

    // Try WebLN first; fall back to a QR modal that watches for the 9735 receipt.
    const paid = await attemptWebLN(invoice.bolt11);
    if (paid) {
      setPayInvoice(invoice);
      setPayState("paid");
      onSubmit(meta);
      return;
    }
    setPayInvoice(invoice);
    setPayReceiptWatch({
      formACoord: aCoord,
      responseId: responseEvent.id,
      authorPubkey: pubKey,
      requiredMsats,
      relays: zapRelays,
      lud16,
      contact,
    });
    setPayModalOpen(true);
    setPayState("awaitingPayment");
  };

  const handlePaid = () => {
    setPayModalOpen(false);
    setPayState("paid");
    onSubmit(payMeta ?? undefined);
  };

  const handleMenuSelect = async (key: string) => {
    setMenuAnchor(null);
    const action = (anon: boolean) =>
      collectsPayments ? handlePay(anon) : submitForm(anon);
    if (key === "signSubmition") await action(false);
    else await action(true);
  };

  const handleButtonClick = async () => {
    if (collectsPayments) await handlePay(!selfSign);
    else await submitForm(!selfSign);
  };

  const items = [
    {
      label: t("filler.submit.menu.anonymous"),
      key: "submit",
      disabled: selfSign,
    },
    {
      label: edit
        ? t("filler.submit.menu.updateResponse")
        : t("filler.submit.menu.asYourself"),
      key: "signSubmition",
      disabled: false,
    },
  ];

  const settings = getFormSettings(formTemplate);
  const requireWebhookPass = settings?.requireWebhookPass ?? false;
  const collectsPayments = settings?.collectsPayments ?? false;
  const payAmountSats = settings?.paymentAmountSats ?? 0;

  const showPayButton = collectsPayments && payState !== "paid";

  return (
    <div>
      {/* If webhook required but not validated yet → show Validate button */}
      {requireWebhookPass && !isValidated ? (
        <Button
          variant="contained"
          color="success"
          onClick={validateWebhook}
          disabled={isDisabled}
          className="validate-button"
          data-testid="validate-button"
          startIcon={
            isValidating ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isValidating
            ? t("filler.submit.validating")
            : t("common.actions.validate")}
        </Button>
      ) : showPayButton ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonGroup
              variant="contained"
              color="warning"
              disabled={isDisabled || disabled || payState === "paying"}
              data-testid="pay-button"
            >
              <Button onClick={handleButtonClick}>
                {payState === "paying" ? (
                  <Box
                    component="span"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                  >
                    <CircularProgress size={16} color="inherit" />
                    {t("filler.submit.pay.paying")}
                  </Box>
                ) : payState === "awaitingPayment" ? (
                  t("filler.submit.pay.awaitingPayment")
                ) : selfSign ? (
                  t("filler.submit.pay.payButton", { amount: payAmountSats })
                ) : (
                  t("filler.submit.pay.payButton", { amount: payAmountSats })
                )}
              </Button>
              <Button
                aria-label={t("filler.submit.menu.moreOptions")}
                data-testid="submit-options-button"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ minWidth: 36, px: 0.5 }}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
          </Box>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {items.map((item) => (
              <MenuItem
                key={item.key}
                disabled={item.disabled}
                onClick={() => handleMenuSelect(item.key)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonGroup
              variant="contained"
              disabled={isDisabled || disabled}
              data-testid="submit-button"
            >
              <Button onClick={handleButtonClick}>
                {disabled ? (
                  disabledMessage || t("filler.submit.disabledFallback")
                ) : isSubmitting ? (
                  <Box
                    component="span"
                    sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                  >
                    <CircularProgress size={16} color="inherit" />
                    {t("filler.submit.submitting")}
                  </Box>
                ) : selfSign ? (
                  items[1].label
                ) : (
                  t("common.actions.submit")
                )}
              </Button>
              <Button
                aria-label={t("filler.submit.menu.moreOptions")}
                data-testid="submit-options-button"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ minWidth: 36, px: 0.5 }}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
          </Box>
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {items.map((item) => (
              <MenuItem
                key={item.key}
                disabled={item.disabled}
                onClick={() => handleMenuSelect(item.key)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {/* Feedback messages */}
      {validationMessage && (
        <div
          style={{ color: "green", marginTop: 8 }}
          data-testid="validation-success"
        >
          {validationMessage}
        </div>
      )}
      {payState === "paid" && (
        <div style={{ color: "green", marginTop: 8 }} data-testid="pay-success">
          {t("filler.submit.pay.paid")}
        </div>
      )}
      {(errorMessage || payError) && (
        <div
          style={{ color: "red", marginTop: 8 }}
          className="submit-button"
          data-testid="submit-error"
        >
          {t("filler.submit.errorPrefix")}: {errorMessage || payError}
        </div>
      )}

      {/* Relay publish status modal */}
      <RelayPublishModal
        relays={relays}
        acceptedRelays={acceptedRelays}
        isOpen={isSubmitting}
      />

      {/* Zap payment QR modal — watches for the matching kind-9735 receipt */}
      {payModalOpen && payInvoice && payReceiptWatch && (
        <ZapPayModal
          open={payModalOpen}
          bolt11={payInvoice.bolt11}
          hash={payInvoice.hash}
          amountMsats={payInvoice.amountMsats}
          lud16={payReceiptWatch.lud16}
          contact={payReceiptWatch.contact}
          formACoord={payReceiptWatch.formACoord}
          responseId={payReceiptWatch.responseId}
          authorPubkey={payReceiptWatch.authorPubkey}
          requiredMsats={payReceiptWatch.requiredMsats}
          relays={payReceiptWatch.relays}
          onPaid={handlePaid}
          onCancel={() => {
            setPayModalOpen(false);
            setPayState("idle");
          }}
        />
      )}
    </div>
  );
};
