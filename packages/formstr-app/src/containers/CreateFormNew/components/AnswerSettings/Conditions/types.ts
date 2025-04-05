export interface ConditionRule {
  questionId: string;
  value: string | string[];
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

export interface ConditionGroup {
  rules: ConditionRule[];
  nextLogic?: "AND" | "OR";
}

export interface ConditionsProps {
  answerSettings: {
    conditions?: {
      rules: ConditionGroup[];
    };
  };
  handleAnswerSettings: (settings: any) => void;
}
