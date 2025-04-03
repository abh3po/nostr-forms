export interface ConditionGroup {
  questionId?: string;
  value?: string | string[];
  rules?: ConditionGroup[];
  operator?:
    | "equals"
    | "notEquals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "greaterThanEqual"
    | "lessThanEqual";
  nextLogic?: "AND" | "OR";
}

export interface ConditionsProps {
  answerSettings: {
    displayIf?: {
      rules: ConditionGroup[];
    };
  };
  handleAnswerSettings: (settings: any) => void;
}
