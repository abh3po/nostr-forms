import type { Hex } from "./core";

// TODO: Implement NIP26 types more accurately
export type DelegationQuery = string;

/** nostr:delegation:<pubkey of publisher (delegatee)>:<conditions query string> */
export type DelegationTokenMessage = `nostr:delegation:${Hex}:${DelegationQuery}`;

/**
 * @description DelegationTag is a tag for delegation. defined by NIP-26
 * @link https://github.com/nostr-protocol/nips/blob/master/26.md#introducing-the-delegation-tag
 *
 * @example
 * ```json
 * [
 *   "delegation",
 *   <pubkey of the delegator>,
 *   <conditions query string>,
 *   <delegation token: 64-byte Schnorr signature of the sha256 hash of the delegation string>
 * ]
 * ```
 */
export type DelegationTag = ["delegation", pubkey: Hex, query: DelegationQuery, token: Hex];
