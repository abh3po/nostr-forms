import { SectionData } from "../../providers/FormBuilder/typeDefs";

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
  globalColor?: string;
  nrpcPubkey?: string;
  nrpcMethod?: string;
}
