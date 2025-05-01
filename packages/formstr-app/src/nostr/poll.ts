import { EventTemplate, finalizeEvent, getPublicKey, SimplePool , Event } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

  export const findPubkey = async (secret?: string) => {
    let secretKey;
    let pubkey;
    if (secret) {
      secretKey = hexToBytes(secret);
      pubkey = getPublicKey(secretKey);
    } else {
      pubkey = await window.nostr?.getPublicKey();
    }
    return pubkey;
  };
  
  export const signEvent = async (event: EventTemplate, secret?: string) => {
    let signedEvent;
    let secretKey;
    if (secret) secretKey = hexToBytes(secret);
    if (secretKey) {
      signedEvent = finalizeEvent(event, secretKey);
    } else {
      signedEvent = await window.nostr?.signEvent(event);
    }
    return signedEvent;
  };


export class MiningTracker {
  public cancelled: boolean;
  public maxDifficultySoFar: number;
  public hashesComputed: number;
  constructor() {
    this.cancelled = false;
    this.maxDifficultySoFar = 0;
    this.hashesComputed = 0;
  }

  cancel() {
    this.cancelled = true;
  }
}
