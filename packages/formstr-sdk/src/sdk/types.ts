export interface NormalizedForm {
  settings: any;
  id: string;
  name: string;
  description?: string;
  fields: Record<string, NormalizedField>;
  html?: {
    form: string;
    attachSubmit?: (callback: (values: Record<string, any>) => void) => void;
  };
  sections?: SectionData[];
  fieldOrder: string[];
  blocks?: FormBlock[];
  relays: string[];
}

export type FormBlock = IntroBlock | SectionBlock;

export interface IntroBlock {
  type: "intro";
  title?: string;
  description?: string;
}

export interface SectionBlock {
  type: "section";
  id: string;
  title?: string;
  description?: string;
  questionIds: string[];
  order: number;
}

export interface Field {
  id: string;
  type: string; // "text", "option", "label", etc
  label: string;
  options?: { id: string; label: string }[];
  settings?: Record<string, any>;
}

export interface NormalizedField {
  id: string;
  type: string;
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

export type Tag = string[];
