import { Card, Input, Select, Tooltip } from "antd";
import { ChangeEvent, useState } from "react";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import CardHeader from "./CardHeader";
import Inputs from "./Inputs";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";
import StyledWrapper from "./index.style";
import { SmallDashOutlined, DragOutlined } from "@ant-design/icons";
import QuestionTextStyle from "./question.style";
import { Field } from "../../providers/FormBuilder";
import { Choice } from "./InputElements/OptionTypes/types";
import UploadImage from "./UploadImage";
import { SectionData } from "../../providers/FormBuilder/typeDefs";

type QuestionCardProps = {
  question: Field;
  onEdit: (question: Field, tempId: string) => void;
  onReorderKey: (keyType: "UP" | "DOWN", tempId: string) => void;
  firstQuestion: boolean;
  lastQuestion: boolean;
  sections?: SectionData[];
  onMoveToSection?: (sectionId?: string) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onEdit,
  onReorderKey,
  firstQuestion,
  lastQuestion,
  sections,
  onMoveToSection,
}) => {
  let options = JSON.parse(question[4] || "[]") as Array<Choice>;
  const answerSettings = JSON.parse(
    question[5] || '{"renderElement": "shortText"}'
  );
  const { 
    setQuestionIdInFocus,
    getSectionForQuestion,
    moveQuestionToSection 
  } = useFormBuilderContext();

  const [isDragging, setIsDragging] = useState(false);

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

  const currentSectionId = getSectionForQuestion(question[1]);

  // Section drag & drop handling
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.setData("questionId", question[1]);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <StyledWrapper>
      <Card 
        type="inner" 
        className={`question-card ${isDragging ? 'dragging' : ''}`}
        onClick={onCardClick}
        style={{
          opacity: isDragging ? 0.6 : 1,
          position: 'relative'
        }}
      >
        <div className="drag-icon">
          <SmallDashOutlined />
        </div>
        
        {/* Add section drag handle */}
        {sections && sections.length > 0 && (
          <Tooltip title="Drag to move between sections">
            <div 
              className="section-drag-handle"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                cursor: 'grab',
                zIndex: 10,
                backgroundColor: '#f0f0f0',
                padding: '6px',
                borderRadius: '4px'
              }}
            >
              <DragOutlined />
            </div>
          </Tooltip>
        )}
        
        <CardHeader
          required={answerSettings.required}
          onRequired={handleRequiredChange}
          question={question}
          onReorderKey={onReorderKey}
          firstQuestion={firstQuestion}
          lastQuestion={lastQuestion}
        />
        <div
          className="question-text"
          style={{ justifyContent: "space-between", display: "flex" }}
        >
          <QuestionTextStyle style={{ width: "100%" }}>
            <label>
              <Input.TextArea
                key={question[1]}
                className="question-input"
                onChange={handleTextChange}
                value={question[3] || "Click to edit"}
                placeholder="Enter a Question"
                autoSize
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

        {sections && sections.length > 0 && onMoveToSection && (
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Move to section"
            value={currentSectionId || undefined}
            onChange={(value) => onMoveToSection(value)}
            allowClear
          >
            {sections.map((section) => (
              <Select.Option key={section.id} value={section.id}>
                {section.title || 'Untitled Section'}
              </Select.Option>
            ))}
          </Select>
        )}

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