import type { Event, PrimitiveTags } from "./core";

/**
 * @description Deletion event defined in NIP-9
 * @link https://github.com/nostr-protocol/nips/blob/master/09.md
 * @example
 * ```json
 * {
 *   "kind": 5,
 *   "pubkey": <32-bytes hex-encoded public key of the event creator>,
 *   "tags": [
 *     ["e", "dcd59..464a2"],
 *     ["e", "968c5..ad7a4"],
 *     ["a", "<kind>:<pubkey>:<d-identifier>"],
 *     ["k", "1"],
 *     ["k", "30023"]
 *   ],
 *   "content": "these posts were published by accident",
 *   ...other fields
 * }
 * ```
 */
export interface DeletionEvent extends Event {
  kind: 5;
  tags: PrimitiveTags["E" | "A" | "K" | "COMMON"][];
  content: string | "";
}
