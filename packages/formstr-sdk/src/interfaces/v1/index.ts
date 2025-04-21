export interface FormSpec {
  schemaVersion: string;
  schemaLink?: string;
  name: string;
  fields?: Array<Field>;
  description?: string;
  settings?: IFormSettings;
  metadata?: unknown;
}

export interface V1FormSpec {
  schemaVersion: string;
  schemaLink?: string;
  name: string;
  fields?: Array<V1Field>;
  settings?: IFormSettings;
  metadata?: unknown;
}

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
  country = "country",
  ai = "ai",
}

export interface Choice {
  choiceId: string;
  label: string;
  isOther?: boolean;
}

export interface V1Choice {
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

export interface V1AnswerSettings {
  choices?: Array<V1Choice>;
  numberConstraints?: NumberConstraint;
  required?: boolean;
  [key: string]: unknown;
}

export interface Field {
  question: string;
  answerType: AnswerTypes;
  answerSettings: AnswerSettings;
}

export interface V1Field {
  question: string;
  questionId: string;
  answerType: AnswerTypes;
  answerSettings: V1AnswerSettings;
}

export interface V1Response {
  questionId: string;
  questionLabel: string;
  answer: string | number | boolean;
  displayAnswer: string;
  message?: string;
}

export interface V1Submission {
  questionId: string;
  answer: string | number | boolean;
  message?: string;
}

export interface FormResponses {
  [pubkey: string]: {
    responses: Array<FormResponse>;
    authorName: string;
  };
}

export interface FormResponse {
  response: Array<V1Response>;
  createdAt: string;
}

export interface IFormSettings {
  titleImageUrl?: string;
  description?: string;
  thankYouPage?: boolean;
  notifyNpubs?: Array<string>;
  publicForm?: boolean;
  disallowAnonymous?: boolean;
}
