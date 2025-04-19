import { schnorr } from "@noble/curves/secp256k1";
import { hexToBytes } from "@noble/hashes/utils";
import type { Event } from "../types/core";
import { verifyDelegation } from "./nips26";
import { hasTag, hashEvent } from "./utils";

/**
 * @description Verify a direct event signature not considering NIP-26
 * @link https://github.com/nostr-protocol/nips/blob/master/1.md
 */
export const verifyDirectEvent = (event: Event): boolean => {
  return schnorr.verify(hexToBytes(event.sig), hashEvent(event), hexToBytes(event.pubkey));
};

/**
 * @description Verify an event signature considering NIP-26 "Delegated Event Signing"
 * @link https://github.com/nostr-protocol/nips/blob/master/1.md
 * @link https://github.com/nostr-protocol/nips/blob/master/26.md
 */
export const verifyEvent = (event: Event): boolean => {
  if (hasTag(event, "delegation") && !verifyDelegation(event)) return false;
  return verifyDirectEvent(event);
};
