import { V1Field } from "@formstr/sdk/dist/interfaces";
import { Card, Divider } from "antd";
import { InputFiller } from "./InputFiller";

interface QuestionProps {
  field: V1Field;
  inputHandler: (questionId: string, answer?: string | null, message?: string) => void;
  required: boolean;
}

export const QuestionNode: React.FC<QuestionProps> = ({
  field,
  inputHandler,
  required,
}) => {
  const answerHandler = (questionId: string) => {
    return (answer?: string | null, message?: string) => {
      return inputHandler(questionId, answer, message);
    };
  };

  return (
    <Card type="inner" className="filler-question">
      <div>
        <label>
          {required && <span style={{ color: "#ea8dea" }}>* &nbsp;</span>}
          {field.question}
        </label>
      </div>
      <Divider />
      <InputFiller
        answerType={field.answerType}
        answerSettings={field.answerSettings}
        onChange={answerHandler(field.questionId)}
      />
    </Card>
  );
};
