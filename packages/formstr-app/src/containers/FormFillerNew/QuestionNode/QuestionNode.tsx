import { Card, Divider } from "antd";
import { InputFiller } from "./InputFiller";
import { AnswerTypes } from "../../../constants";
import { Option } from "@formstr/sdk/dist/formstr/nip101";
import SafeMarkdown from "../../../components/SafeMarkdown";

interface QuestionProps {
  label: string;
  fieldConfig: any;
  fieldId: string;
  options: Option[];
  inputHandler: (questionId: string, answer: string, message?: string) => void;
  required: boolean;
  disabled?: boolean;
  value?: any;
  testId: string;
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
    >
      {required && <span style={{ color: "#ea8dea" }}>* &nbsp;</span>}
      <div className="question-text">
        <SafeMarkdown>{label}</SafeMarkdown>
      </div>
      {fieldConfig.renderElement === AnswerTypes.label ? null : <Divider />}
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
