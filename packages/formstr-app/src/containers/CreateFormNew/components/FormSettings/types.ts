export interface IFormSettings {
  titleImageUrl?: string;
  titleBackgroundType?: "image" | "color";
  titleBackgroundColor?: string;
  titleTextSize?: number;
  titleTextColor?: string;
  titleTextXOffset?: number;
  titleTextYOffset?: number;
  showBanner?: boolean;
  description?: string;
  thankYouPage?: boolean;
  notifyNpubs?: Array<string>;
  publicForm?: boolean;
  disallowAnonymous?: boolean;
  formId?: string;
  encryptForm?: boolean
  viewKeyInUrl?: boolean
}
