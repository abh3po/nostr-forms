import { Card } from "antd";
import { useRef, useState } from "react";
import { useEditable } from "use-editable";
import { IQuestion } from "../../typeDefs";
import CardHeader from "./CardHeader";
import Inputs from "./Inputs";

type QuestionCardProps = {
  question: IQuestion;
  onEdit: (question: IQuestion, tempId: string) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onEdit }) => {
  const questionRef = useRef(null);
  const [questionText, setQuestionText] = useState("Click to edit");
  const [required, setRequired] = useState(false);

  const handleTextChange = (text: string) => {
    setQuestionText(text);
    onEdit({ ...question, question: questionText }, question.tempId);
  };

  useEditable(questionRef, handleTextChange);

  const handleRequiredChange = (required: boolean) => {
    setRequired(required);
    let answerSettings = question.answerSettings;
    answerSettings = { ...answerSettings, required };
    onEdit({ ...question, answerSettings }, question.tempId);
  };

  return (
    <Card
      type="inner"
      style={{
        maxWidth: "100%",
        margin: "10px",
        textAlign: "left",
      }}
    >
      <CardHeader required={required} onRequired={handleRequiredChange} />

      <div style={{ marginBottom: 10 }}>
        <label ref={questionRef}>{questionText}</label>
      </div>

      <Inputs
        inputType={question.answerType}
        inputSettingsHandler={() => {
          return;
        }}
      />
    </Card>
  );
};

export default QuestionCard;
