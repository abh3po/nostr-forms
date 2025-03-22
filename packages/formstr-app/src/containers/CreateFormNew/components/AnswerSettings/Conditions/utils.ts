import { Field } from "../../../providers/FormBuilder";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";

export const getQuestionType = (questionId: string, availableQuestions: Field[]): string => {
  const question = availableQuestions.find((q) => q[1] === questionId);
  if (!question) return AnswerTypes.shortText;

  try {
    const answerSettings = JSON.parse(question[5] || "{}");
    return answerSettings.renderElement || AnswerTypes.shortText;
  } catch {
    return AnswerTypes.shortText;
  }
};

export const getQuestionChoices = (questionId: string, availableQuestions: Field[]): Array<[string, string]> => {
  const question = availableQuestions.find((q) => q[1] === questionId);
  if (!question) return [];

  try {
    const options = JSON.parse(question[4] || "[]") as Array<[string, string]>;
    return options;
  } catch (e) {
    return [];
  }
};

export const getQuestionLabel = (questionId: string, questionsList: Field[]): string => {
  const question = questionsList.find((q) => q[1] === questionId);
  if (!question) return "";
  return question[3] || "";
};