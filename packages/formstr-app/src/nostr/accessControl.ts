import {
  Event,
  Filter,
  SimplePool,
  UnsignedEvent,
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
} from "nostr-tools";
import { AccessRequest, IWrap } from "./types";
import { nip44Encrypt } from "./utils";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { getDefaultRelays } from "./common";
import { sha256 } from "@noble/hashes/sha256";
import { DEFAULT_RELAYS, NOSTR_KINDS, NOSTR_TAGS } from "../constants/nostr";

const now = () => Math.round(Date.now() / 1000);

type Rumor = UnsignedEvent & { id: string };

// Use DEFAULT_RELAYS directly from constants

const createRumor = (event: Partial<UnsignedEvent>, privateKey: Uint8Array) => {
  const rumor = {
    created_at: now(),
    content: "",
    tags: [],
    ...event,
    pubkey: getPublicKey(privateKey),
  } as any;

  rumor.id = getEventHash(rumor);

  return rumor as Rumor;
};

const createSeal = (
  rumor: Rumor,
  privateKey: Uint8Array,
  recipientPublicKey: string
) => {
  return finalizeEvent(
    {
      kind: NOSTR_KINDS.RUMOR,
      content: nip44Encrypt(
        privateKey,
        recipientPublicKey,
        JSON.stringify(rumor)
      ),
      created_at: now(),
      tags: [],
    },
    privateKey
  ) as Event;
};

const createWrap = (
  event: Event,
  recipientPublicKey: string,
  eventAuthor: string,
  d_tag: string
) => {
  const randomKey = generateSecretKey();
  let aliasPubKey = bytesToHex(
    sha256(`${NOSTR_KINDS.FORM_TEMPLATE}:${eventAuthor}:${d_tag}:${recipientPublicKey}`)
  );
  // console.log("Alias pubkey created is", aliasPubKey);
  return finalizeEvent(
    {
      kind: NOSTR_KINDS.GIFT_WRAP,
      content: nip44Encrypt(
        randomKey,
        recipientPublicKey,
        JSON.stringify(event)
      ),
      created_at: now(),
      tags: [[NOSTR_TAGS.P_TAG, aliasPubKey]],
    },
    randomKey
  ) as Event;
};

const sendToUserRelays = async (wrap: Event, pubkey: string) => {
  let pool = new SimplePool();
  // console.log("Sending event to relays", DEFAULT_RELAYS, wrap);
  let messages = await Promise.allSettled(pool.publish(DEFAULT_RELAYS, wrap));
  // console.log("Relay replies", messages);
  pool.close(DEFAULT_RELAYS);
};

export const sendWraps = async (wraps: IWrap[]) => {
  wraps.forEach(async (wrap) => {
    sendToUserRelays(wrap.receiverWrapEvent, wrap.receiverPubkey);
    if (wrap.senderWrapEvent) {
      sendToUserRelays(wrap.senderWrapEvent, wrap.issuerPubkey);
    }
    console.log("Published gift wrap for", wrap.receiverPubkey);
  });
};

const createTag = (
  signingKey?: Uint8Array,
  voterKey?: Uint8Array,
  viewKey?: Uint8Array
) => {
  let tags: string[][] = [];
  if (signingKey) {
    tags.push([NOSTR_TAGS.EDIT_ACCESS, bytesToHex(signingKey)]);
  }
  if (viewKey) {
    tags.push([NOSTR_TAGS.VIEW_ACCESS, bytesToHex(viewKey)]);
  }
  if (voterKey) {
    tags.push([NOSTR_TAGS.SUBMIT_ACCESS, bytesToHex(voterKey)]);
  }
  return tags;
};

export const grantAccess = (
  formEvent: Event | UnsignedEvent,
  pubkey: string,
  signingKey: Uint8Array,
  viewKey?: Uint8Array,
  isEditor?: boolean
): IWrap => {
  const issuerPubkey = getPublicKey(signingKey);
  const formId = formEvent.tags.find((t) => t[0] === NOSTR_TAGS.D_TAG)?.[1];
  if (!formId) throw "Cannot grant access to a form without an Id";

  const rumor = createRumor(
    {
      kind: NOSTR_KINDS.PERMISSION,
      pubkey: issuerPubkey,
      tags: [
        ...createTag(
          isEditor ? signingKey : undefined,
          undefined,
          viewKey ? viewKey : undefined
        ),
      ],
    },
    signingKey
  );
  const seal = createSeal(rumor, signingKey, pubkey);
  const receiverWrap = createWrap(seal, pubkey, issuerPubkey, formId);
  const senderWrap = createWrap(seal, issuerPubkey, issuerPubkey, formId);

  return {
    receiverWrapEvent: receiverWrap,
    receiverPubkey: pubkey,
    issuerPubkey: issuerPubkey,
  };
};

export const acceptAccessRequests = async (
  requests: AccessRequest[],
  signingKey: string,
  formEvent: Event
) => {
  let newFormEvent: Event | UnsignedEvent = formEvent;
  let wraps: IWrap[] = [];
  requests.forEach((request) => {
    let wrap = grantAccess(
      newFormEvent,
      request.pubkey,
      hexToBytes(signingKey)
    );
    wraps.push(wrap);
    newFormEvent.tags.push([NOSTR_TAGS.P_TAG, request.pubkey]);
  });
  newFormEvent.created_at = Math.floor(Date.now() / 1000);
  let finalEvent = finalizeEvent(newFormEvent, hexToBytes(signingKey));
  console.log("FINAL EDITED EVENT IS", finalEvent);
  const pool = new SimplePool();
  let a = await Promise.allSettled(pool.publish(DEFAULT_RELAYS, finalEvent));
  console.log("Published!!!", a);
  pool.close(DEFAULT_RELAYS);
  await sendWraps(wraps);
};
