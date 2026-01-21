export interface NormalizedForm {
  id: string;
  pubkey: string;
  name: string;
  settings: FormSettings;
  fields: Record<string, NormalizedField>;
  fieldOrder: string[];
  sections?: SectionData[];
  html?: { form: string };
}

export interface NormalizedField {
  id: string;
  type: "text" | "option" | "label";
  labelHtml: string;
  options?: NormalizedOption[];
  config: FieldConfig;
  primitive?: "string" | "number" | "boolean";
}

export interface NormalizedOption {
  id: string;
  labelHtml: string;
  config?: any;
}

export interface FieldConfig {
  required?: boolean;
  renderElement?: string;
  multiple?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface FormSettings {
  description?: string;
  titleImageUrl?: string;
  encryptForm?: boolean;
  viewKeyInUrl?: boolean;
  sections?: SectionData[];
  [key: string]: any;
}

export interface SectionData {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  order: number;
}

export interface ResponseSubmission {
  [fieldId: string]: string | string[];
}
