import { UnsignedEvent, generateSecretKey, getPublicKey } from "nostr-tools";
import { customPublish, getDefaultRelays, signEvent } from "./common";
import { IWrap, Tag } from "./types";
import { nip44Encrypt } from "./utils";
import { grantAccess, sendWraps } from "./accessControl";
import { hexToBytes } from "@noble/hashes/utils";
import { DEFAULT_RELAYS, NOSTR_KINDS, NOSTR_TAGS } from "../constants/nostr";

// Use DEFAULT_RELAYS directly from constants

interface MergedNpub {
  pubkey: string;
  isParticipant?: boolean;
  isEditor?: boolean;
}

const getMergedNpubs = (
  viewList: Set<string>,
  editList: Set<string>
): MergedNpub[] => {
  let ViewNpubs = Array.from(viewList).map((hexPub) => {
    return {
      pubkey: hexPub,
      isParticipant: true,
    };
  });

  let EditNpubs = Array.from(editList).map((hexPub) => {
    return {
      pubkey: hexPub,
      isEditor: true,
    };
  });

  const map = new Map();
  ViewNpubs.forEach((item) => map.set(item.pubkey, item));
  EditNpubs.forEach((item) =>
    map.set(item.pubkey, { ...map.get(item.pubkey), ...item })
  );
  return Array.from(map.values());
};

export const createForm = async (
  form: Array<Tag>,
  relayList: Array<string> = DEFAULT_RELAYS,
  viewList: Set<string>,
  EditList: Set<string>,
  encryptContent?: boolean,
  onRelayAccepted?: (url: string) => void,
  secretKey?: string | null,
  viewKeyParams?: string | null
) => {
  let acceptedRelays: string[] = [];
  let signingKey: Uint8Array;
  let viewKey: Uint8Array;

  if (secretKey) signingKey = hexToBytes(secretKey);
  else signingKey = generateSecretKey();
  let formPubkey = getPublicKey(signingKey);

  if (viewKeyParams) viewKey = hexToBytes(viewKeyParams);
  else viewKey = generateSecretKey();

  let tags: Tag[] = [];
  let formId = form.find((tag: Tag) => tag[0] === NOSTR_TAGS.D_TAG)?.[1];
  if (!formId) {
    throw Error("Invalid Form: No formId found");
  }
  let name = form.find((tag: Tag) => tag[0] === NOSTR_TAGS.NAME)?.[1] || "";
  let mergedNpubs = getMergedNpubs(viewList, EditList);
  tags.push([NOSTR_TAGS.D_TAG, formId]);
  tags.push([NOSTR_TAGS.NAME, name]);
  let content = "";
  if (encryptContent)
    content = nip44Encrypt(
      signingKey,
      getPublicKey(viewKey),
      JSON.stringify(form)
    );
  else {
    tags = [
      ...tags,
      ...form.filter((tag: Tag) => ![NOSTR_TAGS.D_TAG, NOSTR_TAGS.NAME].includes(tag[0])),
    ];
  }
  relayList.forEach((r: string) => tags.push([NOSTR_TAGS.RELAY, r]));
  const baseTemplateEvent: UnsignedEvent = {
    kind: NOSTR_KINDS.FORM_TEMPLATE,
    created_at: Math.floor(Date.now() / 1000),
    tags: tags,
    content: content,
    pubkey: formPubkey,
  };
  let baseFormEvent = baseTemplateEvent;
  let wraps: IWrap[] = [];
  mergedNpubs.forEach((profile: MergedNpub) => {
    let wrap = grantAccess(
      baseFormEvent,
      profile.pubkey,
      signingKey,
      viewKey,
      profile.isEditor
    );
    wraps.push(wrap);
    if (profile.isParticipant) {
      baseFormEvent.tags.push([NOSTR_TAGS.ALLOWED, profile.pubkey]);
    }
    baseFormEvent.tags.push([NOSTR_TAGS.P_TAG, profile.pubkey]);
  });

  const templateEvent = await signEvent(baseTemplateEvent, signingKey);
  await sendWraps(wraps);
  await Promise.allSettled(
    customPublish(relayList, templateEvent, (url: string) => {
      acceptedRelays.push(url);
      onRelayAccepted?.(url);
    })
  );
  console.log("Accepted by relays", acceptedRelays);
  return {
    signingKey,
    viewKey,
    acceptedRelays,
  };
};
