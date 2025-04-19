import type { Hex } from "./core";

/**
 * @description A metadata structure defined in NIP11 for relays to communicate their own attributes to clients.
 * @link https://github.com/nostr-protocol/nips/blob/master/11.md
 *
 * @example
 * ```bash
 * ~> curl -H "Accept: application/nostr+json" https://eden.nostr.land | jq
 * ```
 *
 * ```json
 * {
 *   "description": "nostr.landリレーファミリー (us-or-01)",
 *   "name": "nostr.land",
 *   "pubkey": "52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd",
 *   "software": "custom",
 *   "supported_nips": [1, 2, 4, 9, 11, 12, 16, 20, 22, 28, 33, 40],
 *   "version": "1.0.1",
 *   "limitation": {
 *     "payment_required": true,
 *     "max_message_length": 65535,
 *     "max_event_tags": 2000,
 *     "max_subscriptions": 20,
 *     "auth_required": false
 *   },
 *   "payments_url": "https://eden.nostr.land",
 *   "fees": {
 *     "subscription": [
 *       {
 *         "amount": 2500000,
 *         "unit": "msats",
 *         "period": 2592000
 *       }
 *     ]
 *   },
 * }
 * ```
 */
export type RelayInfomaion = {
  icon?: string;
  name: string;
  description: string;
  pubkey: Hex;
  contact: string;
  supported_nips: number[];
  software: string;
  version: string;

  relay_countries?: string[];
  language_tags?: string[];
  tags?: string[];
  posting_policy?: string;

  limitation?: Partial<RelayLimitationPolicy>;
  retention?: Partial<RelayRetentionPolicy>;
} & Partial<RelayPaymentInfomaion>;

export type RelayLimitationPolicy = {
  max_message_length: number;
  max_subscriptions: number;
  max_filters: number;
  max_limit: number;
  max_subid_length: number;
  max_event_tags: number;
  max_content_length: number;
  min_pow_difficulty: number;
  auth_required: boolean;
  payment_required: boolean;
  restricted_writes: boolean;
  created_at_lower_limit: number;
  created_at_upper_limit: number;
};

export type RelayRetentionPolicy = {
  // [number, number] means [min, max]
  kinds?: (number | [number, number])[];
  count?: number;
  time?: number;
}[];

export type RelayPaymentInfomaion = {
  payments_url: string;
  fees: Record<
    string,
    {
      amount: number;
      unit: string; //TODO: union of all possible values,
      kinds?: number[];
      period?: number;
    }
  >;
};
