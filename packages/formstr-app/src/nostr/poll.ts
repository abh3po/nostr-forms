import { EventTemplate, finalizeEvent, getPublicKey, SimplePool , Event } from "nostr-tools";
import { pollRelays } from "./common";
import { hexToBytes } from "@noble/hashes/utils";



  export const fetchUserProfile = async (pubkey: string, pool: SimplePool) => {
    let result = await pool.get(pollRelays, { kinds: [0], authors: [pubkey] });
    return result;
  };

  export async function parseContacts(contactList: Event) {
    if (contactList) {
      return contactList.tags.reduce<Set<string>>((result, [name, value]) => {
        if (name === "p") {
          result.add(value);
        }
        return result;
      }, new Set<string>());
    }
    return new Set<string>();
  }
  
  export const fetchUserProfiles = async (
    pubkeys: string[],
    pool: SimplePool
  ) => {
    let result = await pool.querySync(pollRelays, {
      kinds: [0],
      authors: pubkeys,
    });
    return result;
  };
  
  export const fetchComments = async (eventIds: string[], pool: SimplePool) => {
    let result = await pool.querySync(pollRelays, {
      kinds: [1],
      "#e": eventIds,
    });
    return result;
  };
  
  export const fetchLikes = async (eventIds: string[], pool: SimplePool) => {
    let result = await pool.querySync(pollRelays, {
      kinds: [7],
      "#e": eventIds,
    });
    return result;
  };
  
  export const fetchZaps = async (eventIds: string[], pool: SimplePool) => {
    let result = await pool.querySync(pollRelays, {
      kinds: [9735],
      "#e": eventIds,
    });
    return result;
  };
  
  export function openProfileTab(npub: `npub1${string}`) {
    let url = `https://njump.me/${npub}`;
    window?.open(url, "_blank")?.focus();
  }
  
  export const getATagFromEvent = (event: Event) => {
    let d_tag = event.tags.find((tag) => tag[0] === "d")?.[1];
    let a_tag = d_tag
      ? `${event.kind}:${event.pubkey}:${d_tag}`
      : `${event.kind}:${event.pubkey}:`;
    return a_tag;
  };
  
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
