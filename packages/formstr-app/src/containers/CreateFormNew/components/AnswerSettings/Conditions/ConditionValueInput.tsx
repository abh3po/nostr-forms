import React from "react";
import { Select, Input, InputNumber, DatePicker, TimePicker } from "antd";
import { ConditionRule } from "./types";
import { getQuestionType, getQuestionChoices } from "./utils";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { Field } from "../../../providers/FormBuilder";
import dayjs from "dayjs";

interface ConditionValueInputProps {
  rule: ConditionRule;
  questionsList: Field[];
  availableQuestions: Field[];
  onUpdate: (field: string, value: any) => void;
}

const ConditionValueInput: React.FC<ConditionValueInputProps> = ({
  rule,
  availableQuestions,
  onUpdate,
}) => {
  const questionType = getQuestionType(rule.questionId, availableQuestions);
  const choices = getQuestionChoices(rule.questionId, availableQuestions);

  const renderOperatorSelector = () => {
    if (questionType === AnswerTypes.number) {
      return (
        <Select
          value={rule.operator || "equals"}
          onChange={(value) => onUpdate("operator", value)}
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
          onChange={(value) => onUpdate("operator", value)}
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
          onChange={(value) => onUpdate("operator", value)}
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
            onChange={(value) => onUpdate("value", value)}
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
            onChange={(value) => onUpdate("value", value)}
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
            onChange={(value) => onUpdate("value", value?.toString())}
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
              onUpdate("value", date?.format("YYYY-MM-DD"))
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
              onUpdate("value", time?.format("HH:mm:ss"))
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
            onChange={(e) => onUpdate("value", e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      );
  }
};

export default ConditionValueInput;