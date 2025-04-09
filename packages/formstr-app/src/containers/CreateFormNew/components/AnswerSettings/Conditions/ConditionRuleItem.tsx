import React from "react";
import { Button, Select, Typography, Badge } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ConditionRule } from "./types";
import { Field } from "../../../providers/FormBuilder";
import ConditionValueInput from "./ConditionValueInput";
import LogicSelector from "./LogicSelector";
import { COLORS } from "./StyleWrapper";

const { Text } = Typography;

interface ConditionRuleItemProps {
  rule: ConditionRule;
  index: number;
  isLastItem: boolean;
  questionsList: Field[];
  availableQuestions: Field[];
  groupIndex?: number;
  onUpdate: (index: number, field: string, value: any, groupIndex?: number) => void;
  onRemove: (index: number, groupIndex?: number) => void;
}

const ConditionRuleItem: React.FC<ConditionRuleItemProps> = ({
  rule,
  index,
  isLastItem,
  questionsList,
  availableQuestions,
  groupIndex,
  onUpdate,
  onRemove,
}) => {
  const handleUpdate = (field: string, value: any) => {
    onUpdate(index, field, value, groupIndex);
  };

  const handleLogicChange = (value: "AND" | "OR") => {
    onUpdate(index, "nextLogic", value, groupIndex);
  };

  const handleRemove = () => {
    onRemove(index, groupIndex);
  };

  return (
    <div className="rule-content">
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
        <Badge 
          color={COLORS.SUCCESS}
          style={{ marginRight: '8px' }} 
        />
        <Text strong>Condition {index + 1}</Text>
      </div>

      <div className="rule-item">
        <Text className="rule-label">Show this field if</Text>
        <Select
          placeholder="Select question"
          value={rule.questionId}
          onChange={(value) => handleUpdate("questionId", value)}
          style={{ width: "100%" }}
        >
          {availableQuestions.map((q) => (
            <Select.Option key={q[1]} value={q[1]}>
              {q[3]}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="rule-item" style={{ marginTop: 15 }}>
        <Text className="rule-label">Expected answer</Text>
        <ConditionValueInput
          rule={rule}
          questionsList={questionsList}
          availableQuestions={availableQuestions}
          onUpdate={handleUpdate}
        />
      </div>

      <LogicSelector
        item={rule}
        isLastItem={isLastItem}
        onLogicChange={handleLogicChange}
      />

      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={handleRemove}
        className="remove-button"
      >
        Remove Condition
      </Button>
    </div>
  );
};

export default ConditionRuleItem;