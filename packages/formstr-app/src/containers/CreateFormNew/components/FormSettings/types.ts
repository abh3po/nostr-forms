import { SectionData } from "../../providers/FormBuilder/typeDefs";

export interface IColorSettings {
  global?: string;
  title?: string;
  description?: string;
  question?: string;
}

export interface IFormSettings {
  titleImageUrl?: string;
  description?: string;
  thankYouPage?: boolean;
  notifyNpubs?: string[];
  publicForm?: boolean;
  disallowAnonymous?: boolean;
  encryptForm?: boolean;
  viewKeyInUrl?: boolean;
  formId?: string;
  sections?: SectionData[];
  backgroundImageUrl?: string;
  cardTransparency?: number;
  /** @deprecated use colors.global instead */
  globalColor?: string;
  colors?: IColorSettings;
  thankYouScreenImageUrl?: string;
  formstrBranding?: boolean;
  nrpcPubkey?: string;
  nrpcMethod?: string;
  requireWebhookPass?: boolean;
  disablePreview?: boolean;
  /** When true, filling this form requires a Lightning zap to the author before the response counts. */
  collectsPayments?: boolean;
  /** Author's Lightning address (name@domain) that receives the zap. Validated to be NIP-57 zap-capable. */
  paymentLud16?: string;
  /** Required zap amount in whole sats. */
  paymentAmountSats?: number;
  /** npub or email the payer can contact if payment fails. Required to enable collectsPayments (app-level only). */
  contact?: string;
}
