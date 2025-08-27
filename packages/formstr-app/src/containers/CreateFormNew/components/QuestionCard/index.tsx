import { Card, Input, Select, Space } from "antd";
import { ChangeEvent } from "react";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import CardHeader from "./CardHeader";
import Inputs from "./Inputs";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";
import StyledWrapper from "./index.style";
import QuestionTextStyle from "./question.style";
import { Choice } from "./InputElements/OptionTypes/types";
import UploadImage from "./UploadImage";
import { Field } from "../../../../nostr/types";
import { ColorfulMarkdownTextarea } from "../../../../components/SafeMarkdown/ColorfulMarkdownInput";

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
  let options = JSON.parse(question[4] || "[]") as Array<Choice>;
  const answerSettings = JSON.parse(
    question[5] || '{"renderElement": "shortText"}'
  );
  const {
    setQuestionIdInFocus,
    sections,
    getSectionForQuestion,
    moveQuestionToSection,
  } = useFormBuilderContext();

  const currentSectionId = getSectionForQuestion(question[1]);

  const handleTextChange = (value: string) => {
    let field = question;
    field[3] = value;
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

  const handleSectionChange = (sectionId: string) => {
    if (sectionId === "unsectioned") {
      moveQuestionToSection(question[1], undefined);
    } else {
      moveQuestionToSection(question[1], sectionId);
    }
  };

  return (
    <StyledWrapper>
      <Card type="inner" className="question-card" onClick={onCardClick}>
        <CardHeader
          required={answerSettings.required}
          onRequired={handleRequiredChange}
          question={question}
          onReorderKey={onReorderKey}
          firstQuestion={firstQuestion}
          lastQuestion={lastQuestion}
        />

        {!!sections.length && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <span style={{ fontSize: 12, color: "#8c8c8c" }}>Section:</span>
              <Select
                size="small"
                value={currentSectionId || "unsectioned"}
                onChange={handleSectionChange}
                style={{ minWidth: 120 }}
                placeholder="Select section"
              >
                <Select.Option value="unsectioned">Unsectioned</Select.Option>
                {sections.map((section) => (
                  <Select.Option key={section.id} value={section.id}>
                    {section.title || "Untitled Section"}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>
        )}

        <div
          className="question-text"
          style={{ justifyContent: "space-between", display: "flex" }}
        >
          <QuestionTextStyle style={{ width: "100%" }}>
            <label style={{ width: "100%" }}>
              <ColorfulMarkdownTextarea
                key={question[1]}
                value={question[3] || ""}
                onChange={handleTextChange}
                placeholder="Enter a Question"
              />
            </label>
          </QuestionTextStyle>
          <UploadImage
            onImageUpload={(markdownUrl) => {
              const currentDisplay = question[3] || "";
              const newDisplay = currentDisplay
                ? `${currentDisplay}\n\n${markdownUrl}`
                : markdownUrl;

              const field: Field = [
                question[0],
                question[1],
                question[2],
                newDisplay,
                question[4],
                question[5],
              ];

              onEdit(field, field[1]);
            }}
          />
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
