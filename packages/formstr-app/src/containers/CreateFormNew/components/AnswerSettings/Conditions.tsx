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
    margin-top: 10px
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.65);
  }
`;

interface ConditionRule {
  questionId: string;
  value: string | string[];
}

interface ConditionsProps {
  answerSettings: {
    conditions?: {
      rules: ConditionRule[];
      logicType?: "AND" | "OR";
    };
  };
  handleAnswerSettings: (settings: any) => void;
}

interface ConditionRule {
  questionId: string;
  value: string | string[];
  operator?:
    | "equals"
    | "greaterThan"
    | "lessThan"
    | "greaterThanEqual"
    | "lessThanEqual";
}

const Conditions: React.FC<ConditionsProps> = ({
  answerSettings,
  handleAnswerSettings,
}) => {
  const { questionsList, questionIdInFocus } = useFormBuilderContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("Question Id in focus is", questionIdInFocus);
  const availableQuestions = questionsList.filter(
    (q) => q[1] !== questionIdInFocus
  );

  const conditions = answerSettings.conditions || {
    rules: [],
  };

  const handleAddRule = () => {
    const newConditions = {
      ...conditions,
      rules: [...conditions.rules, { questionId: "", value: "" }],
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
      // Reset value when changing question
      const questionType = getQuestionType(value);
      newRules[index] = {
        questionId: value,
        value: questionType === AnswerTypes.checkboxes ? [] : "",
      };
    } else {
      newRules[index] = {
        ...newRules[index],
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
    console.log("Get QuestionLabel called", availableQuestions);
    const question = questionsList.find((q) => q[1] === questionId);
    console.log("Quest ion is ", question);
    if (!question) return "";
    return question[3] || "";
  };

  // Render value input based on question type
  // In Conditions.tsx
  const renderValueInput = (rule: ConditionRule, index: number) => {
    const questionType = getQuestionType(rule.questionId);
    const choices = getQuestionChoices(rule.questionId);

    console.log("rule", rule);
    switch (questionType) {
      case "radioButton":
      case "dropdown":
        return (
          <Select
            placeholder="Select answer"
            value={rule.value}
            onChange={(value) => updateRule(index, "value", value)}
            style={{ width: "100%" }}
          >
            {choices.map(([id, label]) => (
              <Select.Option key={id} value={id}>
                {" "}
                {/* Changed to use ID instead of label */}
                {label}
              </Select.Option>
            ))}
          </Select>
        );

      case "checkboxes":
        return (
          <Select
            mode="multiple"
            placeholder="Select answers"
            value={Array.isArray(rule.value) ? rule.value : []}
            onChange={(value) => updateRule(index, "value", value)}
            style={{ width: "100%" }}
          >
            {choices.map(([id, label]) => (
              <Select.Option key={id} value={id}>
                {" "}
                {/* Changed to use ID instead of label */}
                {label}
              </Select.Option>
            ))}
          </Select>
        );
      case AnswerTypes.number:
        return (
          <div>
            <Select
              value={rule.operator || "equals"}
              onChange={(value) => updateRule(index, "operator", value)}
              style={{ width: "100px", marginRight: "8px" }}
            >
              <Select.Option value="equals">=</Select.Option>
              <Select.Option value="greaterThan">&gt;</Select.Option>
              <Select.Option value="lessThan">&lt;</Select.Option>
              <Select.Option value="greaterThanEqual">≥</Select.Option>
              <Select.Option value="lessThanEqual">≤</Select.Option>
            </Select>
            <InputNumber
              placeholder="Enter value"
              value={
                typeof rule.value === "string" ? Number(rule.value) : undefined
              }
              onChange={(value) =>
                updateRule(index, "value", value?.toString())
              }
              style={{ width: "calc(100% - 108px)" }}
            />
          </div>
        );
      case AnswerTypes.date:
        return (
          <DatePicker
            placeholder="Select expected date"
            value={
              typeof rule.value === "string" ? dayjs(rule.value) : undefined
            }
            onChange={(date) =>
              updateRule(index, "value", date?.format("YYYY-MM-DD"))
            }
            style={{ width: "100%" }}
          />
        );
      case AnswerTypes.time:
        return (
          <TimePicker
            placeholder="Select expected time"
            value={
              typeof rule.value === "string"
                ? dayjs(rule.value, "HH:mm:ss")
                : undefined
            }
            onChange={(time) =>
              updateRule(index, "value", time?.format("HH:mm:ss"))
            }
            style={{ width: "100%" }}
          />
        );
      default:
        return (
          <Input
            placeholder="Enter expected answer"
            value={typeof rule.value === "string" ? rule.value : ""}
            onChange={(e) => updateRule(index, "value", e.target.value)}
            style={{ width: "100%" }}
          />
        );
    }
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
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          <div style={{ marginBottom: "20px" }}>
            {questionIdInFocus ? (
              <Typography.Text
                style={{ fontSize: 16, marginBottom: 30, fontWeight: "bold" }}
              >
                Conditions for:{" "}
                <Typography.Text
                  style={{
                    fontSize: 16,
                    marginBottom: 30,
                    fontWeight: "normal",
                  }}
                >
                  {getQuestionLabel(questionIdInFocus)}
                </Typography.Text>
              </Typography.Text>
            ) : null}
          </div>
          {conditions.rules.length > 1 && (
            <div className="rule-item">
              <Text className="rule-label">Condition Chaining Strategy</Text>
              <Select
                value={conditions.logicType || "AND"}
                onChange={(value) =>
                  handleAnswerSettings({
                    conditions: {
                      ...conditions,
                      logicType: value,
                    },
                  })
                }
                style={{ width: "100%", marginTop: 5 }}
              >
                <Select.Option value="AND">
                  All conditions must be true
                </Select.Option>
                <Select.Option value="OR">
                  Any condition must be true
                </Select.Option>
              </Select>
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginTop: 20,
            }}
          >
            {conditions.rules.map((rule, index) => (
              <div key={index} className="condition-rule">
                <div className="rule-item">
                  <Text className="rule-label">Show this filed if</Text>
                  <Select
                    placeholder="Select question"
                    value={rule.questionId}
                    onChange={(value) => updateRule(index, "questionId", value)}
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

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveRule(index)}
                  style={{ marginTop: 8 }}
                >
                  Remove Condition
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            onClick={handleAddRule}
            icon={<PlusOutlined />}
            style={{ width: "100%", marginTop: 16 }}
          >
            Add Condition
          </Button>
        </Modal>
      </div>
    </StyleWrapper>
  );
};

export default Conditions;
