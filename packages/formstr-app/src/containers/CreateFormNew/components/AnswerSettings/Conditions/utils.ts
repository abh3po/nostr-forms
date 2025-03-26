import { ConditionRule, ConditionGroup } from "./types";
import { Field } from "../../../providers/FormBuilder";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";


export function isConditionRule(
  condition: ConditionRule | ConditionGroup
): condition is ConditionRule {
  return "questionId" in condition;
}


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


export const evaluateConditionRule = (rule: ConditionRule, formValues: Record<string, any>): boolean => {
  const { questionId, value, operator = "equals" } = rule;
  const formValue = formValues[questionId];

  if (formValue === undefined) return false;

  switch (operator) {
    case "equals":
      if (Array.isArray(value)) {
        return Array.isArray(formValue) && 
          value.length === formValue.length && 
          value.every(v => formValue.includes(v));
      }
      return formValue === value;

    case "notEquals":
      if (Array.isArray(value)) {
        return !Array.isArray(formValue) || 
          value.length !== formValue.length || 
          !value.every(v => formValue.includes(v));
      }
      return formValue !== value;

    case "contains":
      if (typeof formValue !== 'string') return false;
      return formValue.toLowerCase().includes(String(value).toLowerCase());

    case "startsWith":
      if (typeof formValue !== 'string') return false;
      return formValue.toLowerCase().startsWith(String(value).toLowerCase());

    case "endsWith":
      if (typeof formValue !== 'string') return false;
      return formValue.toLowerCase().endsWith(String(value).toLowerCase());

    case "greaterThan":
      return Number(formValue) > Number(value);

    case "lessThan":
      return Number(formValue) < Number(value);

    case "greaterThanEqual":
      return Number(formValue) >= Number(value);

    case "lessThanEqual":
      return Number(formValue) <= Number(value);

    default:
      return false;
  }
};


export const evaluateConditionGroup = (
  group: ConditionGroup, 
  formValues: Record<string, any>
): boolean => {
  if (group.rules.length === 0) return true;

  const logicType = group.nextLogic || 'AND';
  
  if (logicType === 'AND') {
    return group.rules.every(rule => 
      isConditionRule(rule) 
        ? evaluateConditionRule(rule, formValues) 
        : evaluateConditionGroup(rule, formValues)
    );
  } else {
    return group.rules.some(rule => 
      isConditionRule(rule) 
        ? evaluateConditionRule(rule, formValues) 
        : evaluateConditionGroup(rule, formValues)
    );
  }
};


export const shouldShowQuestion = (
  question: Field, 
  formValues: Record<string, any>
): boolean => {
  try {
    const answerSettings = JSON.parse(question[5] || "{}");
    const conditions = answerSettings.conditions;
    
    if (!conditions || !conditions.rules || conditions.rules.length === 0) {
      return true;
    }
    
    return evaluateConditionGroup(conditions, formValues);
  } catch (error) {
    console.error("Error evaluating conditions:", error);
    return true;
  }
};