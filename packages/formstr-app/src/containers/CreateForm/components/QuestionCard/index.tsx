import { Card, Input } from "antd";
import { ChangeEvent } from "react";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import CardHeader from "./CardHeader";
import Inputs from "./Inputs";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";
import StyledWrapper from "./index.style";
import { SmallDashOutlined } from "@ant-design/icons";
import QuestionTextStyle from "./question.style";
import { Field } from "../../providers/FormBuilder";
import { Choice } from "./InputElements/OptionTypes/types";

type QuestionCardProps = {
  question: Field;
  onEdit: (question: Field, tempId: string) => void;
  onReorderKey: (keyType: "UP" | "DOWN", tempId: string) => void;
  firstQuestion: boolean;
  lastQuestion: boolean;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onReorderKey,
  firstQuestion,
  lastQuestion,
}) => {
  console.log("question is", question, question[5]);
  let options = JSON.parse(question[4] || "[]") as Array<Choice>;
  const answerSettings = JSON.parse(
    question[5] || '{"renderElement": "shortText"}'
  );
  const { setQuestionIdInFocus } = useFormBuilderContext();

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    let field = question;
    field[3] = event.target.value;
    onEdit(field, question[1]);
  };

  const handleRequiredChange = (required: boolean) => {
    let newAnswerSettings = { ...answerSettings, required };
    let field = question;
    field[5] = JSON.stringify(newAnswerSettings);
    onEdit(field, question[1]);
  };

  const onCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuestionIdInFocus(question[1]);
  };

  const handleAnswerSettings = (newAnswerSettings: AnswerSettings) => {
    let field = question;
    field[5] = JSON.stringify(newAnswerSettings);
    onEdit(field, question[1]);
  };

  const handleOptions = (newOptions: Choice[]) => {
    let field = question;
    field[4] = JSON.stringify(newOptions);
    onEdit(field, question[1]);
  };

  return (
    <StyledWrapper>
      <Card type="inner" className="question-card" onClick={onCardClick}>
        <div className="drag-icon">
          <SmallDashOutlined />
        </div>
        <CardHeader
          required={answerSettings.required}
          onRequired={handleRequiredChange}
          question={question}
          onReorderKey={onReorderKey}
          firstQuestion={firstQuestion}
          lastQuestion={lastQuestion}
        />
        <div className="question-text">
          <QuestionTextStyle>
            <label>
              <Input.TextArea
                className="question-input"
                onChange={handleTextChange}
                defaultValue={question[3] || "Click to edit"}
                placeholder="Enter a Question"
                autoSize
              />
            </label>
          </QuestionTextStyle>
        </div>

        <Inputs
          inputType={answerSettings.renderElement}
          options={options}
          answerSettings={answerSettings}
          answerSettingsHandler={handleAnswerSettings}
          optionsHandler={handleOptions}
        />
      </Card>
    </StyledWrapper>
  );
};

export default QuestionCard;
