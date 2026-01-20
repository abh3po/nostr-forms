import { Card, Divider } from "antd";
import { InputFiller } from "./InputFiller";
import { AnswerTypes } from "../../../constants";
import SafeMarkdown from "../../../components/SafeMarkdown";
import { IFormSettings } from "../../CreateFormNew/components/FormSettings/types";
import { Choice } from "../../../nostr/types";

interface QuestionProps {
  label: string;
  fieldConfig: any;
  fieldId: string;
  options: Choice[];
  inputHandler: (questionId: string, answer: string, message?: string) => void;
  required: boolean;
  disabled?: boolean;
  value?: any;
  testId: string;
  formSettings: IFormSettings;
}

export const QuestionNode: React.FC<QuestionProps> = ({
  label,
  fieldConfig,
  fieldId,
  options,
  inputHandler,
  required,
  disabled = false,
  value,
  testId,
  formSettings,
}) => {
  const answerHandler = (questionId: string) => {
    return (answer: string, message?: string) => {
      return inputHandler(questionId, answer, message);
    };
  };

  return (
    <Card
      type="inner"
      className="filler-question"
      data-testid={`${testId}:card`}
      style={{
        backgroundColor: `rgba(255, 255, 255,${formSettings.cardTransparency})`, // 0.5 is opacity
      }}
    >
      {required && <span style={{ color: "#ea8dea" }}>* &nbsp;</span>}
      <div className="question-text">
        <SafeMarkdown>{label}</SafeMarkdown>
      </div>
      {fieldConfig.renderElement === AnswerTypes.label ? null : (
        <Divider style={{ marginTop: 0, marginBottom: 24 }} />
      )}
      <InputFiller
        fieldConfig={fieldConfig}
        options={options}
        onChange={answerHandler(fieldId)}
        disabled={disabled}
        defaultValue={value ? value[0] : undefined}
        testId={`${testId}:input`}
      />
    </Card>
  );
};
