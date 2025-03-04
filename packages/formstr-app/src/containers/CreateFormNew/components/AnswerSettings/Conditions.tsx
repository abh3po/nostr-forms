import {
  Select,
  Button,
  Space,
  Typography,
  Modal,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import styled from "styled-components";
import { useState } from "react";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import dayjs from "dayjs";

const { Text } = Typography;

const StyleWrapper = styled.div`
  .conditions {
    padding: 16px;
  }
  .property-title {
    margin-bottom: 16px;
    font-weight: 500;
  }
  .condition-rule {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 16px;
  }
  .rule-item {
    margin-bottom: 12px;
    margin-top: 10px;
  }
  .rule-label {
    margin-top: 10px;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.65);
  }
  .condition-group {
    background: #f0f9ff;
    border: 1px solid #e6f7ff;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .nested-content {
    margin-left: 20px;
    padding-left: 16px;
  }
  .logic-selector {
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: #fafafa;
    border-radius: 4px;
  }
  .logic-label {
    display: block;
    margin-bottom: 5px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 13px;
  }
  .remove-button {
    margin-top: 12px;
  }
`;

interface ConditionRule {
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

interface ConditionGroup {
  rules: (ConditionRule | ConditionGroup)[];
  nextLogic?: "AND" | "OR";
}

interface ConditionsProps {
  answerSettings: {
    conditions?: ConditionGroup;
  };
  handleAnswerSettings: (settings: any) => void;
}

function isConditionRule(
  condition: ConditionRule | ConditionGroup
): condition is ConditionRule {
  return "questionId" in condition;
}

const Conditions: React.FC<ConditionsProps> = ({
  answerSettings,
  handleAnswerSettings,
}) => {
  const { questionsList, questionIdInFocus } = useFormBuilderContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const availableQuestions = questionsList.filter(
    (q) => q[1] !== questionIdInFocus
  );

  const conditions = answerSettings.conditions || {
    rules: [],
  };

  const handleAddRule = () => {
    const newConditions = {
      ...conditions,
      rules: [
        ...conditions.rules,
        {
          questionId: "",
          value: "",
          operator: "equals",
          nextLogic: "AND",
        },
      ],
    };
    handleAnswerSettings({ conditions: newConditions });
  };
  const handleRemoveRule = (index: number) => {
    const newRules = [...conditions.rules];
    newRules.splice(index, 1);
    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...conditions.rules];
    if (field === "questionId") {
      const questionType = getQuestionType(value);
      const existingRule = newRules[index] as ConditionRule;
      const nextLogic = existingRule.nextLogic || "AND";

      newRules[index] = {
        questionId: value,
        value: questionType === AnswerTypes.checkboxes ? [] : "",
        operator: "equals",
        nextLogic: nextLogic,
      };
    } else {
      if (isConditionRule(newRules[index])) {
        const rule = newRules[index] as ConditionRule;
        newRules[index] = {
          ...rule,
          [field]: value,
        };
      } else if (field === "logicType" || field === "nextLogic") {
        const group = newRules[index] as ConditionGroup;
        newRules[index] = {
          ...group,
          [field]: value,
        };
      }
    }

    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  const handleAddGroup = () => {
    const newConditions = {
      ...conditions,
      rules: [
        ...conditions.rules,
        {
          rules: [],
          nextLogic: "AND",
        },
      ],
    };
    handleAnswerSettings({ conditions: newConditions });
  };

  const addNestedRule = (groupIndex: number) => {
    const newRules = [...conditions.rules];
    const group = newRules[groupIndex] as ConditionGroup;
    group.rules = [
      ...group.rules,
      {
        questionId: "",
        value: "",
        operator: "equals",
        nextLogic: "AND",
      },
    ];

    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  const updateNestedRule = (
    groupIndex: number,
    ruleIndex: number,
    field: string,
    value: any
  ) => {
    const newRules = [...conditions.rules];
    const group = newRules[groupIndex] as ConditionGroup;

    if (!isConditionRule(group.rules[ruleIndex])) {
      return;
    }

    const rule = group.rules[ruleIndex] as ConditionRule;

    if (field === "questionId") {
      const questionType = getQuestionType(value);
      group.rules[ruleIndex] = {
        questionId: value,
        value: questionType === AnswerTypes.checkboxes ? [] : "",
        operator: "equals",
        nextLogic: rule.nextLogic || "AND",
      };
    } else {
      group.rules[ruleIndex] = {
        ...rule,
        [field]: value,
      };
    }

    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  const removeNestedRule = (groupIndex: number, ruleIndex: number) => {
    const newRules = [...conditions.rules];
    const group = newRules[groupIndex] as ConditionGroup;
    group.rules = group.rules.filter((_, index) => index !== ruleIndex);

    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  const getQuestionType = (questionId: string): string => {
    const question = availableQuestions.find((q) => q[1] === questionId);
    if (!question) return AnswerTypes.shortText;

    try {
      const answerSettings = JSON.parse(question[5] || "{}");
      return answerSettings.renderElement || AnswerTypes.shortText;
    } catch {
      return AnswerTypes.shortText;
    }
  };

  const getQuestionChoices = (questionId: string): Array<[string, string]> => {
    const question = availableQuestions.find((q) => q[1] === questionId);
    if (!question) return [];

    try {
      const options = JSON.parse(question[4] || "[]") as Array<
        [string, string]
      >;
      return options;
    } catch (e) {
      return [];
    }
  };

  const getQuestionLabel = (questionId: string): string => {
    const question = questionsList.find((q) => q[1] === questionId);
    if (!question) return "";
    return question[3] || "";
  };

  const renderValueInput = (
    rule: ConditionRule,
    index: number,
    groupIndex?: number
  ) => {
    const questionType = getQuestionType(rule.questionId);
    const choices = getQuestionChoices(rule.questionId);

    const handleUpdate = (field: string, value: any) => {
      if (typeof groupIndex === "number") {
        updateNestedRule(groupIndex, index, field, value);
      } else {
        updateRule(index, field, value);
      }
    };

    const renderOperatorSelector = () => {
      if (questionType === AnswerTypes.number) {
        return (
          <Select
            value={rule.operator || "equals"}
            onChange={(value) => handleUpdate("operator", value)}
            style={{ width: "120px", marginRight: "8px" }}
          >
            <Select.Option value="equals">=</Select.Option>
            <Select.Option value="notEquals">≠</Select.Option>
            <Select.Option value="greaterThan">&gt;</Select.Option>
            <Select.Option value="lessThan">&lt;</Select.Option>
            <Select.Option value="greaterThanEqual">≥</Select.Option>
            <Select.Option value="lessThanEqual">≤</Select.Option>
          </Select>
        );
      } else if (
        questionType === "radioButton" ||
        questionType === "dropdown" ||
        questionType === "checkboxes"
      ) {
        return (
          <Select
            value={rule.operator || "equals"}
            onChange={(value) => handleUpdate("operator", value)}
            style={{ width: "120px", marginRight: "8px" }}
          >
            <Select.Option value="equals">equals</Select.Option>
            <Select.Option value="notEquals">not equals</Select.Option>
          </Select>
        );
      } else {
        return (
          <Select
            value={rule.operator || "equals"}
            onChange={(value) => handleUpdate("operator", value)}
            style={{ width: "120px", marginRight: "8px" }}
          >
            <Select.Option value="equals">equals</Select.Option>
            <Select.Option value="notEquals">not equals</Select.Option>
            <Select.Option value="contains">contains</Select.Option>
            <Select.Option value="startsWith">starts with</Select.Option>
            <Select.Option value="endsWith">ends with</Select.Option>
          </Select>
        );
      }
    };

    switch (questionType) {
      case "radioButton":
      case "dropdown":
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderOperatorSelector()}
            <Select
              placeholder="Select answer"
              value={rule.value}
              onChange={(value) => handleUpdate("value", value)}
              style={{ width: "calc(100% - 128px)" }}
            >
              {choices.map(([id, label]) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </div>
        );

      case "checkboxes":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              {renderOperatorSelector()}
            </div>
            <Select
              mode="multiple"
              placeholder="Select answers"
              value={Array.isArray(rule.value) ? rule.value : []}
              onChange={(value) => handleUpdate("value", value)}
              style={{ width: "100%" }}
            >
              {choices.map(([id, label]) => (
                <Select.Option key={id} value={id}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </div>
        );

      case AnswerTypes.number:
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderOperatorSelector()}
            <InputNumber
              placeholder="Enter value"
              value={
                typeof rule.value === "string" ? Number(rule.value) : undefined
              }
              onChange={(value) => handleUpdate("value", value?.toString())}
              style={{ width: "calc(100% - 128px)" }}
            />
          </div>
        );

      case AnswerTypes.date:
        const dateValue = Array.isArray(rule.value) ? undefined : rule.value;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              {renderOperatorSelector()}
            </div>
            <DatePicker
              placeholder="Select expected date"
              value={dateValue ? dayjs(dateValue, "YYYY-MM-DD") : undefined}
              onChange={(date) =>
                handleUpdate("value", date?.format("YYYY-MM-DD"))
              }
              style={{ width: "100%" }}
            />
          </div>
        );

      case AnswerTypes.time:
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              {renderOperatorSelector()}
            </div>
            <TimePicker
              placeholder="Select expected time"
              value={
                typeof rule.value === "string"
                  ? dayjs(rule.value, "HH:mm:ss")
                  : undefined
              }
              onChange={(time) =>
                handleUpdate("value", time?.format("HH:mm:ss"))
              }
              style={{ width: "100%" }}
            />
          </div>
        );

      default:
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              {renderOperatorSelector()}
            </div>
            <Input
              placeholder="Enter expected answer"
              value={typeof rule.value === "string" ? rule.value : ""}
              onChange={(e) => handleUpdate("value", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        );
    }
  };

  const renderLogicSelector = (
    index: number,
    item: ConditionRule | ConditionGroup,
    isLastItem: boolean,
    groupIndex?: number
  ) => {
    if (isLastItem) return null; 

    const logicValue = item.nextLogic || "AND";

    const handleLogicChange = (value: "AND" | "OR") => {
      if (typeof groupIndex === "number") {
        updateNestedRule(groupIndex, index, "nextLogic", value);
      } else {
        updateRule(index, "nextLogic", value);
      }
    };

    return (
      <div className="logic-selector">
        <Text className="logic-label">Connect with next condition:</Text>
        <Select
          value={logicValue}
          onChange={handleLogicChange}
          style={{ width: "100%" }}
        >
          <Select.Option value="AND">
            AND (Both conditions must be true)
          </Select.Option>
          <Select.Option value="OR">
            OR (Either condition can be true)
          </Select.Option>
        </Select>
      </div>
    );
  };

  return (
    <StyleWrapper>
      <div className="conditions">
        <Text className="property-title">Conditions</Text>

        <Button
          type="default"
          onClick={() => setIsModalOpen(true)}
          icon={<SettingOutlined />}
          style={{ width: "100%" }}
        >
          Configure Conditions{" "}
          {conditions.rules.length > 0 && `(${conditions.rules.length})`}
        </Button>

        <Modal
          title={`Conditions for: ${
            questionIdInFocus ? getQuestionLabel(questionIdInFocus) : ""
          }`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginTop: 20,
            }}
          >

            {conditions.rules.length === 0 ? (
              <Text type="secondary">
                No conditions set. This question will always be shown.
              </Text>
            ) : (
              conditions.rules.map((rule, index) => (
                <div key={index} className="condition-rule">
                  {isConditionRule(rule) ? (
                    <div>
                      <div className="rule-item">
                        <Text className="rule-label">Show this field if</Text>
                        <Select
                          placeholder="Select question"
                          value={rule.questionId}
                          onChange={(value) =>
                            updateRule(index, "questionId", value)
                          }
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
                        {renderValueInput(rule, index)}
                      </div>

                      {renderLogicSelector(
                        index,
                        rule,
                        index === conditions.rules.length - 1
                      )}

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveRule(index)}
                        className="remove-button"
                      >
                        Remove Condition
                      </Button>
                    </div>
                  ) : (
                    <div className="condition-group">
                      <div className="nested-content">
                        {(rule as ConditionGroup).rules.length === 0 ? (
                          <Text type="secondary">
                            No conditions in this group. Add one below.
                          </Text>
                        ) : (
                          (rule as ConditionGroup).rules.map(
                            (nestedRule, nestedIndex) => (
                              <div key={nestedIndex} className="condition-rule">
                                {isConditionRule(nestedRule) ? (
                                  <div>
                                    <div className="rule-item">
                                      <Text className="rule-label">
                                        Show this field if
                                      </Text>
                                      <Select
                                        placeholder="Select question"
                                        value={nestedRule.questionId}
                                        onChange={(value) =>
                                          updateNestedRule(
                                            index,
                                            nestedIndex,
                                            "questionId",
                                            value
                                          )
                                        }
                                        style={{ width: "100%" }}
                                      >
                                        {availableQuestions.map((q) => (
                                          <Select.Option
                                            key={q[1]}
                                            value={q[1]}
                                          >
                                            {q[3]}
                                          </Select.Option>
                                        ))}
                                      </Select>
                                    </div>

                                    <div
                                      className="rule-item"
                                      style={{ marginTop: 15 }}
                                    >
                                      <Text className="rule-label">
                                        Expected answer
                                      </Text>
                                      {renderValueInput(
                                        nestedRule,
                                        nestedIndex,
                                        index
                                      )}
                                    </div>

                                    {renderLogicSelector(
                                      nestedIndex,
                                      nestedRule,
                                      nestedIndex ===
                                        (rule as ConditionGroup).rules.length -
                                          1,
                                      index
                                    )}

                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() =>
                                        removeNestedRule(index, nestedIndex)
                                      }
                                      className="remove-button"
                                    >
                                      Remove Condition
                                    </Button>
                                  </div>
                                ) : null}
                              </div>
                            )
                          )
                        )}

                        <Button
                          type="dashed"
                          onClick={() => addNestedRule(index)}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 16 }}
                        >
                          Add Condition to Group
                        </Button>
                      </div>

                      {renderLogicSelector(
                        index,
                        rule,
                        index === conditions.rules.length - 1
                      )}

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveRule(index)}
                        className="remove-button"
                      >
                        Remove Group
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}

            <Space style={{ marginTop: 16 }}>
              <Button
                type="dashed"
                onClick={handleAddRule}
                icon={<PlusOutlined />}
              >
                Add Condition
              </Button>
              <Button
                type="dashed"
                onClick={handleAddGroup}
                icon={<PlusOutlined />}
              >
                Add Group
              </Button>
            </Space>
          </div>
        </Modal>
      </div>
    </StyleWrapper>
  );
};

export default Conditions;
