import { getDefaultRelays } from "@formstr/sdk";
import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { nip44, Event, UnsignedEvent, SimplePool, nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";
import { naddrUrl } from "./utility";

export const fetchKeys = async (
  formAuthor: string,
  formId: string,
  userPub: string
) => {
  const pool = new SimplePool();
  let defaultRelays = getDefaultRelays();
  let aliasPubKey = bytesToHex(
    sha256(`${30168}:${formAuthor}:${formId}:${userPub}`)
  );
  console.log("alias key calculated is", aliasPubKey);
  let giftWrapsFilter = {
    kinds: [1059],
    "#p": [aliasPubKey],
  };

  const accessKeyEvents = await pool.querySync(defaultRelays, giftWrapsFilter);
  console.log("Access Key events", accessKeyEvents);
  pool.close(defaultRelays);
  let keys: Tag[] | undefined;
  await Promise.allSettled(
    accessKeyEvents.map(async (keyEvent: Event) => {
      console.log("Decrypting event,", keyEvent);
      try {
        const sealString = await window.nostr.nip44.decrypt(
          keyEvent.pubkey,
          keyEvent.content
        );
        console.log("Got seal string as", sealString);
        const seal = JSON.parse(sealString) as Event;
        console.log("seal event is ", seal);
        const rumorString = await window.nostr.nip44.decrypt(
          seal.pubkey,
          seal.content
        );
        const rumor = JSON.parse(rumorString) as UnsignedEvent;
        console.log("rumor is ", rumor);
        let key = rumor.tags;
        keys = key;
      } catch (e) {
        console.log("Error in decryption", e);
      }
    })
  );
  return keys;
};

export const getFormSpec = async (
  formEvent: Event,
  userPubKey?: string,
  onKeysFetched?: null | ((keys: Tag[] | null) => void),
  paramsViewKey?: string | null
): Promise<Tag[] | null> => {
  let formId = formEvent.tags.find((t) => t[0] === "d")?.[1];
  if (!formId) {
    throw Error("Invalid Form: Does not have Id");
  }
  console.log("Getting form spec");
  if (formEvent.content === "") {
    return formEvent.tags;
  } else {
    if (!userPubKey && !paramsViewKey) return null;
    let keys;
    if (paramsViewKey) {
      return getDecryptedForm(formEvent, paramsViewKey);
    }
    if (userPubKey)
      keys = await fetchKeys(formEvent.pubkey, formId, userPubKey);
    if (keys && onKeysFetched) onKeysFetched(keys || null);
    let viewKey = keys?.find((k) => k[0] === "ViewAccess")?.[1];
    if (!viewKey) return null;
    return getDecryptedForm(formEvent, viewKey);
  }
};

const getDecryptedForm = (formEvent: Event, viewKey: string) => {
  let conversationKey = nip44.v2.utils.getConversationKey(
    viewKey,
    formEvent.pubkey
  );
  let formSpecString = nip44.v2.decrypt(formEvent.content, conversationKey);
  let FormTemplate = JSON.parse(formSpecString);
  return FormTemplate;
};

export const getAllowedUsers = (formEvent: Event) => {
  return formEvent.tags.filter((t) => t[0] === "allowed").map((t) => t[1]);
};

export const constructFormUrl = (
  pubkey: string,
  formId: string,
  relay: string,
  viewKey?: string
) => {
  let naddr = naddrUrl(pubkey, formId, [relay], viewKey);
  let baseUrl = `${window.location.origin}/#/${naddr}`;
  let finalUrl = baseUrl;
  if (viewKey) finalUrl = finalUrl + `?viewKey=${viewKey}`;
  return finalUrl;
};

export const responsePath = (
  secretKey: string,
  formId: string,
  relay?: string,
  viewKey?: string
) => {
  const baseUrl = `/s/${secretKey}/${formId}`;
  const params = new URLSearchParams();
  if (relay) params.append("relay", relay);
  if (viewKey) params.append("viewKey", viewKey);
  console.log("Parmas to stribng is", params.toString());
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

export const constructNewResponseUrl = (
  secretKey: string,
  formId: string,
  relay?: string,
  viewKey?: string
) => {
  const baseUrl = `${window.location.origin}/#`;
  const responsePart = responsePath(secretKey, formId, relay, viewKey);
  return `${baseUrl}${responsePart}`;
};
