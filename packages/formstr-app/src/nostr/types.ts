import { Event } from "nostr-tools";

export type Field = [
  placeholder: string,
  fieldId: string,
  dataType: string,
  label: string,
  options: string,
  config: string,
];

export type Tag = string[];

export type Option = [
  optionId: string,
  optionLabeL: string,
  optionConfig?: string,
];

export type Response = [
  placeholder: string,
  fieldId: string,
  response: string,
  metadata: string,
];

export type AccesType = "vote" | "view" | "edit";

export interface AccessRequest {
  pubkey: string;
  accessType: AccesType;
}

export interface IWrap {
  receiverWrapEvent: Event;
  senderWrapEvent?: Event;
  receiverPubkey: string;
  issuerPubkey: string;
}

import { NOSTR_KINDS } from "../constants/nostr";

// Re-export the kinds for backward compatibility
export const KINDS = {
  myFormsList: NOSTR_KINDS.MY_FORMS_LIST,
  formTemplate: NOSTR_KINDS.FORM_TEMPLATE,
};
