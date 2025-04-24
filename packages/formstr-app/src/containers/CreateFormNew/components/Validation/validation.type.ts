import { AnswerSettings, AnswerTypes, ValidationRuleTypes } from '@formstr/sdk/dist/interfaces';

export interface IProps {
  answerType: AnswerTypes;
  answerSettings: AnswerSettings;
  handleAnswerSettings: (answerSettings: AnswerSettings) => void;
}

export interface INumberProps {
  label: string;
  value?: number;
  onChange: (val: string) => void;
}

export interface IRules {
  value: ValidationRuleTypes;
  label: string;
}
