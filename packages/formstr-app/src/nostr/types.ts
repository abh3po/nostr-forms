import { Event } from "nostr-tools";

export type Field = [
  placeholder: string,
  fieldId: string,
  dataType: string,
  label: string,
  options: string,
  config: string,
];

export type Tag = string[];

export type Option = [
  optionId: string,
  optionLabeL: string,
  optionConfig?: string,
];

export type Response = [
  placeholder: string,
  fieldId: string,
  response: string,
  metadata: string,
];

export type AccesType = "vote" | "view" | "edit";

export interface AccessRequest {
  pubkey: string;
  accessType: AccesType;
}

export interface IWrap {
  receiverWrapEvent: Event;
  senderWrapEvent?: Event;
  receiverPubkey: string;
  issuerPubkey: string;
}

export const KINDS = {
  myFormsList: 14083,
  formTemplate: 30168,
};

export enum AnswerTypes {
  shortText = "shortText",
  paragraph = "paragraph",
  radioButton = "radioButton",
  checkboxes = "checkboxes",
  dropdown = "dropdown",
  number = "number",
  date = "date",
  label = "label",
  time = "time",
}

export interface Choice {
  choiceId: string;
  label: string;
  isOther?: boolean;
}

export interface NumberConstraint {
  min: number;
  max: number;
}

export enum ValidationRuleTypes {
  range = "range",
  max = "max",
  min = "min",
  regex = "regex",
  match = "match",
}

export interface RangeRule {
  min: number;
  max: number;
}

export interface RegexRule {
  pattern: string;
  errorMessage: string;
}

export interface MatchRule {
  answer: string | number | boolean;
}

export interface MaxRule {
  max: number;
}

export interface MinRule {
  min: number;
}

export interface AnswerSettings {
  renderElement?: string;
  choices?: Array<Choice>;
  numberConstraints?: NumberConstraint;
  required?: boolean;
  validationRules?: {
    [ValidationRuleTypes.range]?: RangeRule;
    [ValidationRuleTypes.max]?: MaxRule;
    [ValidationRuleTypes.min]?: MinRule;
    [ValidationRuleTypes.regex]?: RegexRule;
    [ValidationRuleTypes.match]?: MatchRule;
  };
  [key: string]: unknown;
}
