import React, { ChangeEvent, useRef, useState } from "react";
import QuestionCard from "../QuestionCard";
import { Button, Input, message } from "antd"; 
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { Reorder, motion, useDragControls, DragControls } from "framer-motion";
import { Field } from "../../../../nostr/types";
import { isMobile } from "../../../../utils/utility";
import { LLMFormGenerator, GeneratedFormData } from "../LLMFormGenerator";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { makeTag } from "../../../../utils/utility";

const AI_TYPE_TO_INTERNAL_MAP: { [key: string]: { primitive: string; renderElement: AnswerTypes } } = {
  ShortText: { primitive: 'text', renderElement: AnswerTypes.shortText },
  LongText: { primitive: 'text', renderElement: AnswerTypes.paragraph },
  Paragraph: { primitive: 'text', renderElement: AnswerTypes.paragraph },
  Email: { primitive: 'text', renderElement: AnswerTypes.shortText },
  Number: { primitive: 'number', renderElement: AnswerTypes.number },
  MultipleChoice: { primitive: 'option', renderElement: AnswerTypes.radioButton }, 
  Checkbox: { primitive: 'option', renderElement: AnswerTypes.checkboxes },
  Dropdown: { primitive: 'option', renderElement: AnswerTypes.dropdown },
  Date: { primitive: 'text', renderElement: AnswerTypes.date },
  Time: { primitive: 'text', renderElement: AnswerTypes.time },
  text: { primitive: 'text', renderElement: AnswerTypes.shortText }, 
  choice: { primitive: 'option', renderElement: AnswerTypes.radioButton }, 
  default: { primitive: 'text', renderElement: AnswerTypes.shortText }
};
interface FloatingButtonProps {
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}
const FloatingButton = ({ onClick, containerRef }: FloatingButtonProps) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={containerRef}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{
        position: "fixed",
        right: "30px",
        bottom: "30px",
        zIndex: 1000,
        cursor: "grab",
      }}
      whileTap={{ cursor: "grabbing" }}
      whileDrag={{ scale: 1.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<span style={{ fontSize: "24px", lineHeight: "0" }}>+</span>}
        onClick={() => {
          if (!isDragging) onClick();
        }}
        style={{
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
    </motion.div>
  );
};
interface DraggableQuestionItemProps {
  question: Field;
  onEdit: (question: Field, tempId: string) => void;
  onReorderKey: (keyType: "UP" | "DOWN", tempId: string) => void;
  firstQuestion: boolean;
  lastQuestion: boolean;
  dragControls?: DragControls;
}

const DraggableQuestionItem: React.FC<DraggableQuestionItemProps> = ({
  question,
  onEdit,
  onReorderKey,
  firstQuestion,
  lastQuestion,
}) => {
  const currentlyMobile = isMobile();
  const dragControls = currentlyMobile ? useDragControls() : undefined;

  return (
    <Reorder.Item
      value={question}
      key={question[1]}
      dragListener={!currentlyMobile}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.03,
        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
        zIndex: 10,
        cursor: "grabbing",
      }}
      style={{ cursor: "grab" }}
    >
      <QuestionCard
        question={question}
        onEdit={onEdit}
        onReorderKey={onReorderKey}
        firstQuestion={firstQuestion}
        lastQuestion={lastQuestion}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

export const QuestionsList = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    formSettings,
    questionsList,
    editQuestion,
    setQuestionIdInFocus,
    updateFormSetting,
    updateQuestionsList,
    setIsLeftMenuOpen,
    bottomElementRef,
    updateFormName,
  } = useFormBuilderContext();

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormSetting({ description: e.target.value });
  };

  const onReorderKey = (keyType: "UP" | "DOWN", tempId: string) => {
    const questions = [...questionsList];
    const selectedQuestionIndex = questions.findIndex(
      (question: Field) => question[1] === tempId
    );
    const targetIndex = keyType === "UP" ? selectedQuestionIndex - 1 : selectedQuestionIndex + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    [questions[selectedQuestionIndex], questions[targetIndex]] = [
      questions[targetIndex],
      questions[selectedQuestionIndex],
    ];
    updateQuestionsList(questions);
  };
  const onPlusButtonClick = () => {
    setIsLeftMenuOpen(true);
  };
  const handleAIFormGenerated = (formData: GeneratedFormData) => {
    try {
      updateFormName(formData.title || 'Untitled AI Form');
      updateFormSetting({ description: formData.description || '' });
      const mappedFields: Field[] = formData.fields.map((aiField): Field | null => {
        const uniqueId = makeTag(6);
        const typeMappingLookup = AI_TYPE_TO_INTERNAL_MAP[aiField.type]; 
        let typeMapping = typeMappingLookup || AI_TYPE_TO_INTERNAL_MAP.default;
        let primitiveType = typeMapping.primitive;
        let renderElement = typeMapping.renderElement;
        const isInitialMappingDefaultOrGeneric = !typeMappingLookup || aiField.type === 'text' || aiField.type === 'choice' || aiField.type === undefined;
        const labelLower = aiField.label?.toLowerCase() || '';
        const hasOptions = Array.isArray(aiField.options) && aiField.options.length > 0;

        if (isInitialMappingDefaultOrGeneric) {
            if (hasOptions) {
                if (labelLower.includes('check all') || labelLower.includes('multiple') || labelLower.includes('select several') || labelLower.includes('checkbox')) {
                    typeMapping = AI_TYPE_TO_INTERNAL_MAP['Checkbox'] || AI_TYPE_TO_INTERNAL_MAP.default;
                } else {
                    typeMapping = AI_TYPE_TO_INTERNAL_MAP['MultipleChoice'] || AI_TYPE_TO_INTERNAL_MAP.default; 
                }
            } else if (labelLower.includes('date') || labelLower.includes(' d.o.b') || labelLower.includes('birth')) {
                typeMapping = AI_TYPE_TO_INTERNAL_MAP['Date'] || AI_TYPE_TO_INTERNAL_MAP.default;
            } else if (labelLower.includes('time')) {
                typeMapping = AI_TYPE_TO_INTERNAL_MAP['Time'] || AI_TYPE_TO_INTERNAL_MAP.default;
            } else if (labelLower.includes('number') || labelLower.includes('rating') || labelLower.includes('quantity') || labelLower.includes('age') || labelLower.includes('numeric')) {
                typeMapping = AI_TYPE_TO_INTERNAL_MAP['Number'] || AI_TYPE_TO_INTERNAL_MAP.default;
            } else if (labelLower.includes('email') || labelLower.includes('e-mail')) {
                typeMapping = AI_TYPE_TO_INTERNAL_MAP['Email'] || AI_TYPE_TO_INTERNAL_MAP.default; 
            } else if (labelLower.includes('comment') || labelLower.includes('feedback') || labelLower.includes('address') || labelLower.includes('paragraph') || labelLower.includes('long text') || labelLower.includes('description') || labelLower.length > 80) {
                typeMapping = AI_TYPE_TO_INTERNAL_MAP['LongText'] || AI_TYPE_TO_INTERNAL_MAP.default; 
            }
            primitiveType = typeMapping.primitive;
            renderElement = typeMapping.renderElement;
        }
        const config: any = {
            renderElement: renderElement,
            required: aiField.required || false,
            validationRules: {}
        };
        if (renderElement === AnswerTypes.shortText && (labelLower.includes('email') || labelLower.includes('e-mail') || aiField.type === 'Email')) {
             config.validationRules.regex = {
                 pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                 errorMessage: "Please enter a valid email address."
             };
        }
        const configJson = JSON.stringify(config);
        let optionsJson = '[]';
        if (hasOptions && (
            renderElement === AnswerTypes.radioButton ||
            renderElement === AnswerTypes.checkboxes ||
            renderElement === AnswerTypes.dropdown
        )) {
            const mappedOptions = aiField.options.map((optionLabel: string) => [
                makeTag(6), optionLabel, JSON.stringify({})
            ]);
            optionsJson = JSON.stringify(mappedOptions);
            console.log(`DEBUG: Mapped options for "${aiField.label}" (final type ${renderElement}):`, optionsJson);
        } else if (hasOptions) {
             console.log(`DEBUG: AI provided options for "${aiField.label}", but final type "${renderElement}" doesn't use them.`);
        }
        const newField: Field = [
            'field', uniqueId, primitiveType, aiField.label || `Untitled ${uniqueId}`, optionsJson, configJson
        ];
        return newField;
      }).filter(field => field !== null) as Field[];
      console.log("DEBUG: Final mappedFields array before updating context:", mappedFields);
      updateQuestionsList(mappedFields);
      setQuestionIdInFocus();
      setShowAIGenerator(false);
      message.success("Form generated successfully from description!"); 
    } catch (error) {
        console.error("Error processing AI generated form data:", error);
        const errorMsg = error instanceof Error ? error.message : "Failed to process the generated form data.";
        message.error(errorMsg); 
    }
  };

  return (
    <StyleWrapper
      className="main-content"
      onClick={() => setQuestionIdInFocus()}
      ref={containerRef}
      style={{ position: "relative" }}
    >
      <div style={{ padding: "10px 0", textAlign: "center" }}>
        <Button
          onClick={() => setShowAIGenerator((prev) => !prev)}
          icon={<span role="img" aria-label="sparkles">✨</span>}
        >
          {showAIGenerator ? "Cancel AI Generation" : "Create with AI"}
        </Button>
      </div>

      {showAIGenerator ? (
        <div style={{ marginBottom: "20px", padding: "0 10px" }}>
          <LLMFormGenerator onFormGenerated={handleAIFormGenerated} />
        </div>
      ) : (
        <>
          <div>
            <FormTitle className="form-title" />
            <DescriptionStyle>
              <div className="form-description">
                <Input.TextArea
                  key="description"
                  value={formSettings.description}
                  onChange={handleDescriptionChange}
                  autoSize
                  placeholder="Add a form description (optional, supports Markdown)"
                />
              </div>
            </DescriptionStyle>
          </div>

          {questionsList.length > 0 ? (
             <Reorder.Group
               values={questionsList}
               onReorder={updateQuestionsList}
               className="reorder-group"
             >
               {questionsList.map((question, idx) => (
                 <DraggableQuestionItem
                   key={question[1]}
                   question={question}
                   onEdit={editQuestion}
                   onReorderKey={onReorderKey}
                   firstQuestion={idx === 0}
                   lastQuestion={idx === questionsList.length - 1}
                 />
               ))}
             </Reorder.Group>
          ) : (
             <div style={{textAlign: 'center', padding: '20px', color: 'grey'}}>
               No questions yet. Add some using the menu or "Create with AI".
             </div>
          )}
          <div ref={bottomElementRef} style={{ height: "1px" }}></div>
        </>
      )}

      <div className="mobile-add-btn">
        <FloatingButton onClick={onPlusButtonClick} containerRef={containerRef} />
      </div>
    </StyleWrapper>
  );
};