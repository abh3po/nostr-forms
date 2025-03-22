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
    rules: (ConditionRule | ConditionGroup)[];
    nextLogic?: "AND" | "OR";
  }
  
  export interface ConditionsProps {
    answerSettings: {
      conditions?: ConditionGroup;
    };
    handleAnswerSettings: (settings: any) => void;
  }
  
  export function isConditionRule(
    condition: ConditionRule | ConditionGroup
  ): condition is ConditionRule {
    return "questionId" in condition;
  }