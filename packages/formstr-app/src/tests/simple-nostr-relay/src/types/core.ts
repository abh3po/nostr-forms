import type { ValueOf } from "./utils";

/**
 * @description lowercase hex-encoded string
 * @pattern ^[0-9a-f]+$
 */
export type Hex = string;

/**
 * @description unix timestamp in seconds
 */
export type UnixTimestamp = number;

/**
 * @description Event is a message that is signed by the author's private key and can be verified by the author's public key.
 * @link https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
 *
 * @example
 * ```json
 * {
 *  "id": "4376c65d2f232afbe9b882a35baa4f6fe8667c4e684749af565f981833ed6a65",
 *  "pubkey": "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
 *  "created_at": 1673347337,
 *  "kind": 1,
 *  "content": "Walled gardens became prisons, and nostr is the first step towards tearing down the prison walls.",
 *  "tags": [
 *    ["e", "3da979448d9ba263864c4d6f14984c423a3838364ec255f03c7904b1ae77f206"],
 *    ["p", "bf2376e17ba4ec269d10fcc996a4746b451152be9031fa48e74553dde5526bce"]
 *  ],
 *  "sig": "908a15e46fb4d8675bab026fc230a0e3542bfade63da02d542fb78b2a8513fcd0092619a2c8c1221e581946e0191f2af505dfdf8657a414dbca329186f009262"
 * }
 * ```
 */
export interface Event {
  /**
   * @description 32-bytes lowercase hex-encoded sha256 of the serialized event data
   * @pattern ^[0-9a-f]{64}$
   */
  id: Hex;
  /**
   * @description 32-bytes lowercase hex-encoded public key of the event creator
   * @pattern ^[0-9a-f]{64}$
   */
  pubkey: Hex;
  /**
   * @description unix timestamp in seconds
   */
  created_at: UnixTimestamp;
  /**
   * @description integer between 0 and 65535
   * @minimum 0
   * @maximum 65535
   */
  kind: number;
  /**
   * @description arbitrary array of tags, each tag is an array of strings
   */
  tags: [string, ...string[]][];
  /**
   * @description arbitrary string
   */
  content: string;
  /**
   * @description 64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data, which is the same as the "id" field
   * @pattern ^[0-9a-f]{128}$
   */
  sig: Hex;
}

export type WithRecommendedRelayUrl<E extends [string, string]> = E | [...E, recommendedRelayUrl: string];

export type PrimitiveTags = {
  COMMON: [string, ...string[]];
  /** ["d", <identify>] */
  D: ["d", value: string];
  /** ["e", <32-bytes lowercase hex of the id of another event>, <recommended relay URL, optional>] */
  E: WithRecommendedRelayUrl<["e", eventId: Hex]>;
  /** ["p", <32-bytes lowercase hex of a pubkey>, <recommended relay URL, optional>] */
  P: WithRecommendedRelayUrl<["p", pubkey: Hex]>;
  /**
   * @example
   * ["a", <kind integer>:<32-bytes lowercase hex of a pubkey>:<d tag value>, <recommended relay URL, optional>]
   * or
   * ["a", <kind integer>:<32-bytes lowercase hex of a pubkey>:, <recommended relay URL, optional>]
   */
  A: WithRecommendedRelayUrl<["a", `${number}:${Hex}:${string | ""}`]>;
  /** ["k", <kind integer>] */
  K: ["k", value: `${number}`];
};

/**
 * @description Event Type Constants
 */
export const EventType = {
  /**
   * @description Regular events are expected to be stored by relays.
   */
  REGULAR: "REGULAR",
  /**
   * @description Replaceable events are expected to be stored by relays, with only the latest event for each (pubkey, kind) combination retained.
   */
  REPLACEABLE: "REPLACEABLE",
  /**
   * @description Ephemeral events are not expected to be stored by relays.
   */
  EPHEMERAL: "EPHEMERAL",
  /**
   * @description Parameterized Replaceable events are expected to be stored by relays, with only the latest event for each (pubkey, kind, d-tag value) combination retained.
   */
  PARAMETERIZED_REPLACEBLE: "PARAMETERIZED_REPLACEBLE",
} as const;

/**
 * @description Event Type
 */
export type EventType = ValueOf<typeof EventType>;

/**
 * @description SerializedEvent is for calculating the sha256 hash(id) of the event data
 * @link https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
 *
 * @example
 * ```json
 * [
 *  0,
 *  "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
 *  1673347337,
 *  1,
 *  [["e", "3da979448d9ba263864c4d6f14984c423a3838364ec255f03c7904b1ae77f206"], ["p", "bf2376e17ba4ec269d10fcc996a4746b451152be9031fa48e74553dde5526bce"]],
 *  "Walled gardens became prisons, and nostr is the first step towards tearing down the prison walls."
 * ]
 */
export type SerializedEvent = [
  0,
  /**
   * @description pubkey, as a lowercase hex string
   */
  pubkey: Hex,
  /**
   * @description created_at, as a number
   */
  created_at: UnixTimestamp,
  /**
   * @description kind, as a number
   */
  kind: number,
  /**
   * @description tags, as an array of arrays of non-null strings
   */
  tags: [string, ...string[]][],
  /**
   * @description content, as a string
   */
  content: string,
];

/**
 * @description Subscription is a filter for events
 * @link https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
 *
 * @example
 * ```json
 * {
 *  "ids": ["4376c65d2f232afbe9b882a35baa4f6fe8667c4e684749af565f981833ed6a65"],
 *  "authors": ["6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93"],
 *  ...
 * }
 * ```
 */
export type SubscriptionFilter = Partial<{
  /**
   * @description a list of lowercase hex-encoded event ids
   */
  ids: Hex[];
  /**
   * @description a list of lowercase pubkeys, the pubkey of an event must be one of these
   */
  authors: Hex[];
  /**
   * @description a list of a kind numbers
   */
  kinds: number[];
  /**
   * @description a list of tag values, for #e — a list of event ids, for #p — a list of pubkeys, etc.
   */
  [event: `#${string}`]: string[];
  /**
   * @description an integer unix timestamp in seconds, events must be newer than this to pass
   */
  since: UnixTimestamp;
  /**
   * @description an integer unix timestamp in seconds, events must be older than this to pass
   */
  until: UnixTimestamp;
  /**
   * @description maximum number of events relays SHOULD return in the initial query
   */
  limit: number;
  /**
   * @description natural language query string
   * @link https://github.com/nostr-protocol/nips/blob/master/50.md
   */
  search: string;
}>;

/**
 * @description Client to Relay Payloads
 * @link https://github.com/nostr-protocol/nips/blob/master/01.md#from-client-to-relay-sending-events-and-creating-subscriptions
 */
export type ClientToRelayPayloads = {
  EVENT: ["EVENT", event: Event];
  REQ: ["REQ", subscriptionId: string, ...SubscriptionFilter[]];
  CLOSE: ["CLOSE", subscriptionId: string];
  /** @link https://github.com/nostr-protocol/nips/blob/master/42.md */
  AUTH: ["AUTH", signedChallengeEvent: Event];
  /** @link https://github.com/nostr-protocol/nips/blob/master/45.md */
  COUNT: ["COUNT", subscriptionId: string, ...SubscriptionFilter[]];
};

export type ClientToRelayPayload<T extends keyof ClientToRelayPayloads = keyof ClientToRelayPayloads> = ClientToRelayPayloads[T];

/**
 * @description Reason Message Prefix Constants
 * @link https://github.com/nostr-protocol/nips/blob/master/01.md#from-relay-to-client-sending-events-and-notices
 */
export const ReasonMessagePrefix = {
  DUPLICATE: "duplicate",
  POW: "pow",
  BLOCKED: "blocked",
  RATE_LIMITED: "rate-limited",
  INVALID: "invalid",
  ERROR: "error",
} as const;

export type ReasonMessagePrefix = ValueOf<typeof ReasonMessagePrefix>;
export type ReasonMessage = `${ReasonMessagePrefix}: ${string}` | "";
export type HumanReadableReasonMessage = string;

export type RelayToClientPayloads = {
  /** EVENT payload: send events requested by clients. */
  EVENT: ["EVENT", subscriptionId: string, event: Event];
  /** OK payload: indicate acceptance or denial of an EVENT message. */
  OK: ["OK", eventId: Hex, isOk: boolean, message: ReasonMessage];
  /** EOSE payload: indicate the end of stored events and the beginning of events newly received in real-time. */
  EOSE: ["EOSE", subscriptionId: string];
  /** CLOSED payload: indicate that a subscription was ended on the server side. */
  CLOSED: ["CLOSED", subscriptionId: ReasonMessage];
  /** NOTICE payload: send human-readable error messages or other things to clients. */
  NOTICE: ["NOTICE", message: HumanReadableReasonMessage];
  /** @link https://github.com/nostr-protocol/nips/blob/master/42.md */
  AUTH: ["AUTH", challenge: string];
  /** @link https://github.com/nostr-protocol/nips/blob/master/45.md */
  COUNT: ["COUNT", subscriptionId: string, { count: number; approximate?: boolean }];
};

export type RelayToClientPayload<T extends keyof RelayToClientPayloads = keyof RelayToClientPayloads> = RelayToClientPayloads[T];
