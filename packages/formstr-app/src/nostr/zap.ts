import { Event, Filter, UnsignedEvent, nip19, nip57 } from "nostr-tools";
import { decode as decodeBolt11 } from "light-bolt11-decoder";
import { subscribe, fetchMany, type Subscription } from "../dataLayer";
import { signEvent, getUserPublicKey } from "./common";

// NIP-57 + formstr kinds. Responses (1069) and forms (30168) are linked by the
// `a`-coordinate "30168:<authorPub>:<formId>"; zap receipts (9735) are found by
// the same `#a` tag because we put the form coordinate in the zap request.
export const ZAP_RECEIPT_KIND = 9735;
export const ZAP_REQUEST_KIND = 9734;
export const RESPONSE_KIND = 1069;
export const FORM_KIND = 30168;

export const formACoord = (formAuthorPub: string, formId: string) =>
  `${FORM_KIND}:${formAuthorPub}:${formId}`;

// ---------------------------------------------------------------------------
// LNURL resolution (lud16 -> zap callback). Mirrors the kind-0-based
// nostr-tools `getZapEndpoint`, but takes a lud16 directly so the form author
// can specify a Lightning address independent of their kind-0 profile.
// ---------------------------------------------------------------------------

interface LnurlPayResponse {
  callback?: string;
  allowsNostr?: boolean;
  nostrPubkey?: string;
  [key: string]: unknown;
}

/** Resolves a lud16 ("name@domain") to a NIP-57 zap callback URL, or null if
 * the address is not zap-capable (`allowsNostr` + `nostrPubkey` missing). */
export async function getZapEndpointFromLud16(
  lud16: string,
): Promise<string | null> {
  try {
    const [name, domain] = lud16.trim().split("@");
    if (!name || !domain) return null;
    const res = await fetch(`https://${domain}/.well-known/lnurlp/${name}`);
    if (!res.ok) return null;
    const body = (await res.json()) as LnurlPayResponse;
    if (body.allowsNostr && body.nostrPubkey && body.callback) {
      return body.callback as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function isLud16ZapCapable(lud16: string): Promise<boolean> {
  return (await getZapEndpointFromLud16(lud16)) !== null;
}

// ---------------------------------------------------------------------------
// Zap request (kind 9734) construction.
//
// nostr-tools' `makeZapRequest` only emits an `a` tag for replaceable/
// addressable kinds — not for a 1069 response — and can reference a single
// event. A zap-gated response must tag BOTH the form (a, first) and the
// response (e, second), so we hand-build the template.
// ---------------------------------------------------------------------------

export interface BuildZapRequestParams {
  /** Form author pubkey — the zap recipient (the `p` tag). */
  recipientPubkey: string;
  /** Required amount in millisats. */
  amountMsats: number;
  /** Relays the provider should publish the 9735 receipt to. */
  relays: string[];
  /** Form coordinate "30168:<authorPub>:<formId>" — first referenced event. */
  formACoord: string;
  /** Kind-1069 response event id — second referenced event. */
  responseEventId: string;
}

export function buildZapRequestTemplate(
  params: BuildZapRequestParams,
): UnsignedEvent {
  return {
    kind: ZAP_REQUEST_KIND,
    content: "",
    created_at: Math.floor(Date.now() / 1000),
    pubkey: "", // set in buildAndSignZapRequest before signing
    tags: [
      ["p", params.recipientPubkey],
      ["amount", String(params.amountMsats)],
      ["relays", ...params.relays],
      ["a", params.formACoord], // form — first
      ["e", params.responseEventId], // response — second
      ["k", String(RESPONSE_KIND)],
    ],
  };
}

/** Builds and signs the 9734. For anonymous fillers pass the ephemeral
 * `responderSecretKey`; for identified fillers pass null to use the active
 * signer (same dispatch as `sendResponses`). */
export async function buildAndSignZapRequest(
  params: BuildZapRequestParams,
  responderSecretKey: Uint8Array | null,
): Promise<Event> {
  const responderPub = await getUserPublicKey(responderSecretKey);
  const template = buildZapRequestTemplate(params);
  template.pubkey = responderPub;
  return (await signEvent(template, responderSecretKey)) as Event;
}

// ---------------------------------------------------------------------------
// Invoice fetch + payment-hash extraction.
// ---------------------------------------------------------------------------

export interface ZapInvoice {
  bolt11: string;
  hash: string;
  amountMsats: number;
}

export async function fetchZapInvoice(opts: {
  zapEndpoint: string;
  signedZapRequestEvent: Event;
  amountMsats: number;
}): Promise<ZapInvoice> {
  const nostrParam = encodeURIComponent(JSON.stringify(opts.signedZapRequestEvent));
  const sep = opts.zapEndpoint.includes("?") ? "&" : "?";
  const url = `${opts.zapEndpoint}${sep}amount=${opts.amountMsats}&nostr=${nostrParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LNURL callback failed: ${res.status}`);
  const data = (await res.json()) as { pr?: string; hash?: string; reason?: string };
  if (!data.pr) throw new Error(data.reason || "No invoice in LNURL response");
  const hash = data.hash || decodePaymentHash(data.pr) || "";
  return { bolt11: data.pr, hash, amountMsats: opts.amountMsats };
}

/** Extracts the payment hash from a bolt11 invoice, or null on failure. */
export function decodePaymentHash(bolt11: string): string | null {
  try {
    const decoded = decodeBolt11(bolt11);
    const section = decoded.sections.find((s) => s.name === "payment_hash");
    const value = (section as { value?: string } | undefined)?.value;
    return value ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Zap receipt (kind 9735) verification.
//
// The receipt's `description` tag holds the signed 9734 zap request (JSON). It
// is the authoritative source — the receipt also copies `a`/`e`/`p` into its own
// tags, but those can be spoofed by a malicious relay, so we verify against the
// signed description.
// ---------------------------------------------------------------------------

export interface VerifyReceiptContext {
  formACoord: string;
  authorPubkey: string;
  requiredMsats: number;
}

export interface VerifiedZap {
  ok: true;
  responseId: string;
}

export function verifyZapReceipt(
  receipt: Event,
  ctx: VerifyReceiptContext,
): VerifiedZap | null {
  try {
    const description = receipt.tags.find((t) => t[0] === "description")?.[1];
    if (!description) return null;

    // Re-verify the embedded zap request's signature + basic shape.
    if (nip57.validateZapRequest(description) !== null) return null;

    const zapReq = JSON.parse(description) as Event;
    const aTag = zapReq.tags.find((t) => t[0] === "a")?.[1];
    const eTag = zapReq.tags.find((t) => t[0] === "e")?.[1];
    const pTag = zapReq.tags.find((t) => t[0] === "p")?.[1];

    if (aTag !== ctx.formACoord) return null;
    if (!eTag || !/^[0-9a-f]{64}$/.test(eTag)) return null;
    if (pTag !== ctx.authorPubkey) return null;

    const bolt11 = receipt.tags.find((t) => t[0] === "bolt11")?.[1];
    if (!bolt11) return null;

    const sats = nip57.getSatoshisAmountFromBolt11(bolt11);
    if (sats * 1000 < ctx.requiredMsats) return null;

    return { ok: true, responseId: eTag };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Receipt subscriptions — shared by the pay modal (single response) and the
// responses screen (all responses for a form).
// ---------------------------------------------------------------------------

export interface SubscribeZapReceiptsOpts {
  formACoord: string;
  authorPubkey: string;
  requiredMsats: number;
  relays: string[];
  /** Narrow to a single response (pay modal). Omit to receive all (responses screen). */
  responseId?: string;
  onReceipt: (info: { responseId: string; receipt: Event }) => void;
}

export function subscribeZapReceipts(
  opts: SubscribeZapReceiptsOpts,
): Subscription {
  const filter: Filter = {
    kinds: [ZAP_RECEIPT_KIND],
    "#a": [opts.formACoord],
  };
  if (opts.responseId) filter["#e"] = [opts.responseId];

  return subscribe(
    [filter],
    (event) => {
      const result = verifyZapReceipt(event, {
        formACoord: opts.formACoord,
        authorPubkey: opts.authorPubkey,
        requiredMsats: opts.requiredMsats,
      });
      if (result) opts.onReceipt({ responseId: result.responseId, receipt: event });
    },
    opts.relays,
  );
}

/** One-shot fetch of all response-event-ids backed by a qualifying zap receipt. */
export async function fetchQualifyingResponseIds(opts: {
  formACoord: string;
  authorPubkey: string;
  requiredMsats: number;
  relays: string[];
}): Promise<Set<string>> {
  const events = await fetchMany(
    [{ kinds: [ZAP_RECEIPT_KIND], "#a": [opts.formACoord] }],
    opts.relays,
  );
  const ids = new Set<string>();
  for (const ev of events) {
    const result = verifyZapReceipt(ev, opts);
    if (result) ids.add(result.responseId);
  }
  return ids;
}

// Re-exported for the permalink/viewer path so callers don't need a separate
// nostr-tools import for the common encoding helpers.
export { nip19 };