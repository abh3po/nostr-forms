import React, { useMemo } from "react";
import { Button, Typography, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ConditionGroup } from "./types";
import { Field } from "../../../providers/FormBuilder";
import ConditionRuleItem from "./ConditionRuleItem";
import LogicSelector from "./LogicSelector";
import { BADGE_STYLES, CARD_STYLES, LAYOUT_STYLES } from "./StyleWrapper";

const { Text } = Typography;

interface ConditionGroupItemProps {
  group: ConditionGroup;
  groupIndex: number;
  isLastItem: boolean;
  questionsList: Field[];
  availableQuestions: Field[];
  onUpdateRule: (
    groupIndex: number,
    ruleIndex: number,
    field: string,
    value: any
  ) => void;
  onRemoveRule: (groupIndex: number, ruleIndex: number) => void;
  onAddNestedRule: (groupIndex: number) => void;
  onRemoveGroup: (groupIndex: number) => void;
  onUpdateGroupLogic: (groupIndex: number, value: "AND" | "OR") => void;
}

const ConditionGroupItem: React.FC<ConditionGroupItemProps> = ({
  group,
  groupIndex,
  isLastItem,
  questionsList,
  availableQuestions,
  onUpdateRule,
  onRemoveRule,
  onAddNestedRule,
  onRemoveGroup,
  onUpdateGroupLogic,
}) => {
  const handleAddNestedRule = () => {
    onAddNestedRule(groupIndex);
  };

  const handleLogicChange = (value: "AND" | "OR") => {
    onUpdateGroupLogic(groupIndex, value);
  };

  const conditionRules = useMemo(
    () => group.rules?.filter((rule) => rule.rules) as ConditionGroup[],
    [group.rules]
  );

  return (
    <Card
      className="rule-set-card"
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={BADGE_STYLES.ruleSetBadge}>RS</div>
          <Text strong>Rule Set {groupIndex + 1}</Text>
        </div>
      }
      bordered={true}
      style={CARD_STYLES.ruleSetCard}
      bodyStyle={{ padding: "16px" }}
    >
      <div className="rule-set-content">
        <div className="nested-content">
          {conditionRules.length === 0 ? (
            <Text type="secondary">
              No conditions in this rule set. Add one below.
            </Text>
          ) : (
            conditionRules.map((rule, nestedIndex) => (
              <div key={nestedIndex} className="condition-rule nested-rule">
                <ConditionRuleItem
                  rule={rule}
                  index={nestedIndex}
                  isLastItem={nestedIndex === conditionRules.length - 1}
                  questionsList={questionsList}
                  availableQuestions={availableQuestions}
                  groupIndex={groupIndex}
                  onUpdate={(index, field, value) =>
                    onUpdateRule(groupIndex, index, field, value)
                  }
                  onRemove={(index) => onRemoveRule(groupIndex, index)}
                />
              </div>
            ))
          )}

          <Button
            type="dashed"
            onClick={handleAddNestedRule}
            icon={<PlusOutlined />}
            style={LAYOUT_STYLES.fullWidthButton}
          >
            Add Condition to Rule Set
          </Button>
        </div>

        {!isLastItem && (
          <LogicSelector
            item={group}
            isLastItem={false}
            onLogicChange={handleLogicChange}
            isGroupLogic={true}
          />
        )}

        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveGroup(groupIndex)}
          className="remove-button"
          style={{ marginTop: "16px" }}
        >
          Remove Rule Set
        </Button>
      </div>
    </Card>
  );
};

export default ConditionGroupItem;
