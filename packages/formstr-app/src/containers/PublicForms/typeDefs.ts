import { V1FormSpec } from "../../nostr/types";

export type IV1FormSpec = V1FormSpec & {
  pubkey: string;
};
