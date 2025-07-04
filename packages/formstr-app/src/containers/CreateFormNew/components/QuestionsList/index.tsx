import QuestionCard from "../QuestionCard";
import { Button, Input, Typography } from "antd";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import React, { ChangeEvent, useRef, useState } from "react";
import { Reorder, motion, useDragControls, DragControls } from "framer-motion";
import { Field } from "../../../../nostr/types";
import { isMobile } from "../../../../utils/utility";
import AIFormGeneratorModal from "../AIFormGeneratorModal";

const { Text } = Typography;

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
    isAiModalOpen,
    setIsAiModalOpen,
    handleAIFormGenerated,
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

  return (
    <StyleWrapper
      className="main-content"
      onClick={() => setQuestionIdInFocus()}
      ref={containerRef}
      style={{ position: "relative" }}
    >
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
         <div style={{ textAlign: 'center', padding: '40px', color: 'grey' }}>
                <Text type="secondary">No questions yet. Add some using the sidebar or click "AI Builder" in the header.</Text>
            </div>
        )}
        <div ref={bottomElementRef} style={{ height: "1px" }}></div>
        <div className="mobile-add-btn">
            <FloatingButton onClick={onPlusButtonClick} containerRef={containerRef} />
        </div>
        <AIFormGeneratorModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            onFormGenerated={handleAIFormGenerated}
        />
    </StyleWrapper>
  );
};
