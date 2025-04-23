import { constructFormUrl as constructFormUrlSDK } from "@formstr/sdk";
import { DEVICE_TYPE, DEVICE_WIDTH } from "../constants/index";
import { getItem, LOCAL_STORAGE_KEYS, setItem } from "./localStorage";
import { nip19 } from "nostr-tools";

export function makeTag(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const naddrUrl = (
  publicKey: string,
  formId: string,
  relaysEncode?: string[],
  viewKey?: string,
) => {
  let formUrl = `/f/${nip19.naddrEncode({
    pubkey: publicKey,
    identifier: formId,
    relays: relaysEncode || ["wss://relay.damus.io"],
    kind: 30168,
  })}`;
  if (viewKey) formUrl = formUrl + `?viewKey=${viewKey}`;
  return formUrl;
};

export function constructFormUrl(
  publicKey: string,
  formIdentifier: string | null = null,
) {
  let hostname = window.location.host;
  if (hostname.includes("abhay-raizada")) {
    hostname += "/nostr-forms";
  }
  if (!formIdentifier) `http://${hostname}/fill/${publicKey}/`;
  return !formIdentifier
    ? `http://${hostname}/fill/${publicKey}`
    : `http://${hostname}/f/${publicKey}/${formIdentifier}`;
}

export function constructDraftUrl(
  draft: { formSpec: unknown; tempId: string } | null,
) {
  if (!draft) {
    return;
  }
  let draftHash = window.btoa(encodeURIComponent(JSON.stringify(draft)));
  draftHash = window.encodeURIComponent(draftHash);
  const hostname = window.location.host;

  return `http://${hostname}/drafts/${draftHash}`;
}

export function constructResponseUrl(privateKey: string | null) {
  const hostname = window.location.host;
  return `http://${hostname}/r/${privateKey}/responses`;
}

export function copyToClipBoard(str: string) {
  navigator.clipboard.writeText(str);
}

export const getDeviceType = () => {
  const { innerWidth } = window;
  if (innerWidth <= DEVICE_WIDTH[DEVICE_TYPE.MOBILE]) {
    return DEVICE_TYPE.MOBILE;
  } else if (innerWidth <= DEVICE_WIDTH[DEVICE_TYPE.TABLET]) {
    return DEVICE_TYPE.TABLET;
  } else {
    return DEVICE_TYPE.DESKTOP;
  }
};

export const isMobile = () => getDeviceType() === DEVICE_TYPE.MOBILE;
export const isTablet = () => getDeviceType() === DEVICE_TYPE.TABLET;
export const isDesktop = () => getDeviceType() === DEVICE_TYPE.DESKTOP;

export function appendClass(class1: string, class2: string) {
  if (class1) {
    return class1 + " " + class2;
  }
  return class1 + class2;
}

export function classNames(...classNames: any) {
  let classes = "";
  for (let i = 0; i < classNames.length; i++) {
    const arg = arguments[i];
    if (arg) {
      if (typeof arg === "string") {
        classes = appendClass(classes, arg);
      }
      if (typeof arg !== "object") {
        continue;
      }
      // eslint-disable-next-line no-loop-func
      Object.keys(arg).forEach((v) => {
        if (arg[v]) {
          classes = appendClass(classes, v);
        }
      });
    }
  }

  return classes;
}

export const deleteDraft = (formTempId: string) => {
  type Draft = { formSpec: unknown; tempId: string };
  let draftArr = getItem<Draft[]>(LOCAL_STORAGE_KEYS.DRAFT_FORMS) || [];
  draftArr = draftArr.filter((draft: Draft) => draft.tempId !== formTempId);
  setItem(LOCAL_STORAGE_KEYS.DRAFT_FORMS, draftArr);
};
