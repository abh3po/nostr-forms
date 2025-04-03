import React, { useState, useMemo } from "react";
import {
  Button,
  Space,
  Typography,
  Modal,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { ConditionGroup, ConditionsProps } from "./types";
import { getQuestionLabel } from "./utils";
import StyleWrapper from "./StyleWrapper";
import ConditionGroupItem from "./ConditionGroupItem";

const { Text } = Typography;

const Conditions: React.FC<ConditionsProps> = ({
  answerSettings,
  handleAnswerSettings,
}) => {
  const { questionsList, questionIdInFocus } = useFormBuilderContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all questions except the current one (to avoid circular dependencies)
  const availableQuestions = useMemo(
    () => questionsList.filter((q) => q[1] !== questionIdInFocus),
    [questionsList, questionIdInFocus]
  );

  const conditions = answerSettings.displayIf || {
    rules: [],
  };

  // Helper methods for condition management
  const handleAddGroup = () => {
    const newConditions = {
      ...conditions,
      rules: [
        ...conditions.rules,
        {
          rules: [
            // Add a default empty rule in the group
            {
              questionId: "",
              value: "",
              operator: "equals",
              nextLogic: "AND",
            },
          ],
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

  const updateRuleSetLogic = (index: number, value: "AND" | "OR") => {
    const newRules = [...conditions.rules];
    const group = newRules[index] as ConditionGroup;

    newRules[index] = {
      ...group,
      nextLogic: value,
    };

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
    let currentRule;
    if (!(currentRule = group.rules?.[ruleIndex])) {
      return;
    }

    const rule = currentRule as ConditionGroup;

    if (field === "questionId") {
      group.rules![ruleIndex] = {
        questionId: value,
        value:
          getQuestionType(value, availableQuestions) === AnswerTypes.checkboxes
            ? []
            : "",
        operator: "equals",
        nextLogic: rule.nextLogic || "AND",
      };
    } else {
      group.rules![ruleIndex] = {
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

  const addNestedRule = (groupIndex: number) => {
    const newRules = [...conditions.rules];
    const group = newRules[groupIndex] as ConditionGroup;
    group.rules = [
      ...(group.rules || []),
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

  const removeNestedRule = (groupIndex: number, ruleIndex: number) => {
    const newRules = [...conditions.rules];
    const group = newRules[groupIndex] as ConditionGroup;
    group.rules = (group.rules || []).filter((_, index) => index !== ruleIndex);

    handleAnswerSettings({
      conditions: {
        ...conditions,
        rules: newRules,
      },
    });
  };

  // Helper to get question type (for default values)
  const getQuestionType = (
    questionId: string,
    availableQuestions: any[]
  ): string => {
    const question = availableQuestions.find((q) => q[1] === questionId);
    if (!question) return AnswerTypes.shortText;

    try {
      const answerSettings = JSON.parse(question[5] || "{}");
      return answerSettings.renderElement || AnswerTypes.shortText;
    } catch {
      return AnswerTypes.shortText;
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
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>
                {`Conditions for: ${
                  questionIdInFocus
                    ? getQuestionLabel(questionIdInFocus, questionsList)
                    : ""
                }`}
              </span>
              <div style={{ marginLeft: "12px" }}>
                <Badge
                  count="BETA"
                  style={{
                    backgroundColor: "#722ed1",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Tooltip title="This feature is in beta and may change. Using complex conditions could potentially break your forms in future updates.">
                  <Button
                    type="text"
                    icon={<InfoCircleOutlined />}
                    size="small"
                    style={{ marginLeft: "4px" }}
                  />
                </Tooltip>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalOpen(false)}>
              Save
            </Button>,
          ]}
          width={700}
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
              conditions.rules.map((rule, index) => {
                const isLastItem = index === conditions.rules.length - 1;

                const group = rule as ConditionGroup;

                return (
                  <div key={index}>
                    <ConditionGroupItem
                      group={group}
                      groupIndex={index}
                      isLastItem={isLastItem}
                      questionsList={questionsList}
                      availableQuestions={availableQuestions}
                      onUpdateRule={updateNestedRule}
                      onRemoveRule={removeNestedRule}
                      onAddNestedRule={addNestedRule}
                      onRemoveGroup={handleRemoveRule}
                      onUpdateGroupLogic={(groupIndex, value) =>
                        updateRuleSetLogic(groupIndex, value)
                      }
                    />

                    {!isLastItem && (
                      <div className="inter-group-connector">
                        <Divider>
                          <div
                            className={`logic-badge ${
                              group.nextLogic === "OR" ? "or" : ""
                            }`}
                          >
                            {group.nextLogic || "AND"}
                          </div>
                        </Divider>
                        <div
                          className="connection-label"
                          style={{ textAlign: "center", marginTop: "-10px" }}
                        >
                          <Text type="secondary">
                            Connect with next rule set
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                onClick={handleAddGroup}
                icon={<PlusOutlined />}
              >
                Add Rule Set
              </Button>
            </Space>
          </div>
        </Modal>
      </div>
    </StyleWrapper>
  );
};

export default Conditions;
