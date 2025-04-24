import { V1FormSpec } from '@formstr/sdk/dist/interfaces';

export type IV1FormSpec = V1FormSpec & {
  pubkey: string;
};
