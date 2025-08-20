import { Card, Divider } from "antd";
import { InputFiller } from "./InputFiller";
import Markdown from "react-markdown";
import { AnswerTypes } from "../../../constants";
import { Field, Option } from "@formstr/sdk/dist/formstr/nip101";

interface QuestionProps {
  label: string;
  fieldConfig: any;
  fieldId: string;
  options: Option[]
  inputHandler: (questionId: string, answer: string, message?: string) => void;
  required: boolean;
  testId: string;
}

export const QuestionNode: React.FC<QuestionProps> = ({
  label,
  fieldConfig,
  fieldId,
  options,
  inputHandler,
  required,
  testId,
}) => {
  const answerHandler = (questionId: string) => {
    return (answer: string, message?: string) => {
      return inputHandler(questionId, answer, message);
    };
  };

  return (
    <Card type="inner" className="filler-question" data-testid={`${testId}:card`}>
      {required && <span style={{ color: "#ea8dea" }}>* &nbsp;</span>}
      <div className="question-text">
        <Markdown>{label}</Markdown>
      </div>
      {fieldConfig.renderElement === AnswerTypes.label ? null : <Divider />}
      <InputFiller
        fieldConfig={fieldConfig}
        options={options}
        onChange={answerHandler(fieldId)}
        testId={`${testId}:input`}
      />
    </Card>
  );
};
