// ConditionGroupItem.tsx
import React from "react";
import { Button, Typography, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ConditionGroup, ConditionRule, isConditionRule } from "./types";
import { Field } from "../../../providers/FormBuilder";
import ConditionRuleItem from "./ConditionRuleItem";
import LogicSelector from "./LogicSelector";

const { Text } = Typography;

interface ConditionGroupItemProps {
  group: ConditionGroup;
  groupIndex: number;
  isLastItem: boolean;
  questionsList: Field[];
  availableQuestions: Field[];
  onUpdateRule: (groupIndex: number, ruleIndex: number, field: string, value: any) => void;
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

  return (
    <Card 
      className="rule-set-card"
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '4px', 
            background: '#1890ff', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '10px',
            fontWeight: 'bold'
          }}>
            RS
          </div>
          <Text strong>Rule Set {groupIndex + 1}</Text>
        </div>
      }
      bordered={true}
      style={{ 
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
        borderRadius: '8px',
        borderColor: '#d9d9d9',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="rule-set-content">
        <div className="nested-content">
          {group.rules.length === 0 ? (
            <Text type="secondary">
              No conditions in this rule set. Add one below.
            </Text>
          ) : (
            group.rules.map((nestedRule, nestedIndex) => {
              if (isConditionRule(nestedRule)) {
                return (
                  <div key={nestedIndex} className="condition-rule nested-rule">
                    <ConditionRuleItem
                      rule={nestedRule as ConditionRule}
                      index={nestedIndex}
                      isLastItem={nestedIndex === group.rules.length - 1}
                      questionsList={questionsList}
                      availableQuestions={availableQuestions}
                      groupIndex={groupIndex}
                      onUpdate={(index, field, value) => onUpdateRule(groupIndex, index, field, value)}
                      onRemove={(index) => onRemoveRule(groupIndex, index)}
                    />
                  </div>
                );
              }
              return null;
            })
          )}

          <Button
            type="dashed"
            onClick={handleAddNestedRule}
            icon={<PlusOutlined />}
            style={{ marginTop: 16, width: '100%' }}
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
          style={{ marginTop: '16px' }}
        >
          Remove Rule Set
        </Button>
      </div>
    </Card>
  );
};

export default ConditionGroupItem;