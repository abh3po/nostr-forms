/**
 * Nostr-related constants
 */

export const NOSTR_KINDS = {
  METADATA: 0,
  TEXT_NOTE: 1,
  DIRECT_MESSAGE: 4,
  DELETION: 5,
  REPOST: 6,
  REACTION: 7,
  BADGE_AWARD: 8,
  CHANNEL_CREATION: 40,
  CHANNEL_METADATA: 41,
  CHANNEL_MESSAGE: 42,
  CHANNEL_HIDE_MESSAGE: 43,
  CHANNEL_MUTE_USER: 44,
  RUMOR: 13,
  GIFT_WRAP: 1059,
  PERMISSION: 18,
  FORM_RESPONSE: 1069,
  FORMS_LIST: 30001,
  MY_FORMS_LIST: 14083,
  FORM_TEMPLATE: 30168,
};

export const NOSTR_TAGS = {
  D_TAG: "d",
  P_TAG: "p",
  L_TAG: "l",
  FORMS: "forms",
  FORMSTR: "formstr",
  FIELD: "field",
  NAME: "name",
  SETTINGS: "settings",
  ALLOWED: "allowed",
  RELAY: "relay",
  EDIT_ACCESS: "EditAccess",
  VIEW_ACCESS: "ViewAccess",
  SUBMIT_ACCESS: "SubmitAccess",
  RESPONSE: "response",
};

export const NOSTR_LIMITS = {
  DEFAULT_QUERY_LIMIT: 20,
  PUBLIC_FORMS_LIMIT: 50,
};

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
];

export const TIMEOUTS = {
  CONNECTION_TIMEOUT: 5000,
  PUBLISH_TIMEOUT: 5000,
};