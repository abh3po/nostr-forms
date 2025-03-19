import React from "react";
import { Select, Typography } from "antd";
import { ConditionRule, ConditionGroup, isConditionRule } from "./types";

const { Text } = Typography;

interface LogicSelectorProps {
  item: ConditionRule | ConditionGroup;
  isLastItem: boolean;
  onLogicChange: (value: "AND" | "OR") => void;
  isGroupLogic?: boolean; 
}

const LogicSelector: React.FC<LogicSelectorProps> = ({
  item,
  isLastItem,
  onLogicChange,
  isGroupLogic = false,
}) => {
  if (isLastItem) return null;

  const logicValue = item.nextLogic || "AND";

  const connectionText = isGroupLogic 
    ? "Connect with next rule set:" 
    : "Connect with next condition:";

  return (
    <div className="logic-selector">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: logicValue === 'AND' ? '#1890ff' : '#ff4d4f',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginRight: '8px',
          marginTop: '8px',
          padding: '2px 4px',
          verticalAlign: 'middle',
        }}>
          {logicValue}
        </div>
        <Text className="logic-label" style={{ marginTop: '8px' }}>{connectionText}</Text>
      </div>
      
      <Select
        value={logicValue}
        onChange={onLogicChange}
        style={{ width: "100%" }}
        optionLabelProp="label"
      >
        <Select.Option 
          value="AND" 
          label="AND"
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#1890ff',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '8px',
            }}>
              AND
            </div>
            <span>Both {isGroupLogic ? 'rule sets' : 'conditions'} must be true</span>
          </div>
        </Select.Option>
        <Select.Option 
          value="OR"
          label="OR"
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: '#ff4d4f',
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '8px',
            }}>
              OR
            </div>
            <span>Either {isGroupLogic ? 'rule set' : 'condition'} can be true</span>
          </div>
        </Select.Option>
      </Select>
    </div>
  );
};

export default LogicSelector;