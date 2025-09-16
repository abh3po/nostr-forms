import { AnswerTypes } from "../../../nostr/types";

export const ANSWER_TYPE_MAP = {
  [AnswerTypes.shortText]: "string",
  [AnswerTypes.paragraph]: "string",
  [AnswerTypes.number]: "number",
  [AnswerTypes.radioButton]: "number",
  [AnswerTypes.checkboxes]: "number",
  [AnswerTypes.dropdown]: "number",
  [AnswerTypes.date]: "number",
  [AnswerTypes.label]: "number",
};
