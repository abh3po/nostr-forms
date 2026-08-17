import { Event, nip19 } from "nostr-tools";
import { bytesToHex } from "nostr-tools/utils";
import { encodeNKeys } from "./nkeys";
import { ROUTES } from "../constants/routes";

/**
 * Metadata produced after a successful submit, threaded up to the
 * ThankYouScreen and stored in the local submissions record.
 */
export interface ResponseSubmitMeta {
  responseEventId: string;
  /** NIP-19 nevent encoding of the kind-1069 response (id + relays + author + kind). */
  nevent: string;
  /** Full shareable URL — a capability URL for anonymous submissions. */
  permalink: string;
}

/**
 * Builds a shareable permalink to a single submitted response.
 *
 * Crypto note: response content is NIP-44-encrypted from responder→author.
 * NIP-44 v2 is symmetric ECDH, so each side's secret + the other's (public)
 * pubkey yields the same conversation key. Therefore:
 *  - For ANONYMOUS submissions we embed the responder's ephemeral secret in the
 *    URL hash (via `nkeys`, like the existing responses URL). Anyone with the
 *    link can then decrypt that ONE response — a per-submission capability,
 *    strictly better than embedding the author's per-form key (which decrypts
 *    ALL responses). The form author pubkey is read from the 1069's `a` tag at
 *    view time.
 *  - For IDENTIFIED submissions we never embed a secret (that would leak the
 *    account key). The link then works only for the form author (logged in,
 *    holds the per-form edit key) or for anyone if the form is unencrypted.
 */
export function buildResponsePermalink(
  responseEvent: Event,
  acceptedRelays: string[],
  responderSecretKey: Uint8Array | null,
): ResponseSubmitMeta {
  const nevent = nip19.neventEncode({
    id: responseEvent.id,
    relays: acceptedRelays,
    author: responseEvent.pubkey,
    kind: 1069,
  });
  const path = ROUTES.VIEW_RESPONSE.replace(":nevent", nevent);
  const base = `${window.location.origin}${path}`;

  let permalink = base;
  if (responderSecretKey) {
    permalink = `${base}#${encodeNKeys({ secretKey: bytesToHex(responderSecretKey) })}`;
  }

  return { responseEventId: responseEvent.id, nevent, permalink };
}