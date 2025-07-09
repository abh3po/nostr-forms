import QuestionCard from "../QuestionCard";
import { Button, Input, Empty, Typography } from "antd";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import React, { ChangeEvent, useRef, useState } from "react";
import { Reorder, motion, useDragControls, DragControls } from "framer-motion";
import { Field } from "../../../../nostr/types";
import { isMobile } from "../../../../utils/utility";
import AIFormGeneratorModal from "../AIFormGeneratorModal";
import Section from "../SectionManager/Section";

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

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("questionId", question[1]);
  };

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
      <div
        draggable
        onDragStart={handleDragStart}
      >
        <QuestionCard
          question={question}
          onEdit={onEdit}
          onReorderKey={onReorderKey}
          firstQuestion={firstQuestion}
          lastQuestion={lastQuestion}
          dragControls={dragControls} 
        />
      </div>
    </Reorder.Item>
  );
};

export const QuestionsList = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUnsectionedDropTarget, setIsUnsectionedDropTarget] = useState(false);

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
    sections,
    getSectionForQuestion,
    moveQuestionToSection
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

  // Handle dropping into unsectioned area
  const handleUnsectionedDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUnsectionedDropTarget(true);
  };
  
  const handleUnsectionedDragLeave = () => {
    setIsUnsectionedDropTarget(false);
  };
  
  const handleUnsectionedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsUnsectionedDropTarget(false);
    
    const questionId = e.dataTransfer.getData("questionId");
    if (questionId) {
      moveQuestionToSection(questionId, undefined);
    }
  };

  // Separate questions by sections
  const renderQuestions = () => {
    // If sections are not enabled or no sections exist, render questions as usual
    if (!formSettings.enableSections || !sections || sections.length === 0) {
      return (
        <div>
          <Reorder.Group
            values={questionsList}
            onReorder={updateQuestionsList}
            className="reorder-group"
          >
            <div>
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
              <div ref={bottomElementRef}></div>
            </div>
          </Reorder.Group>
          
          {/* Unsectioned drop area when sections exist but question has no section */}
          {sections.length > 0 && (
            <div
              style={{
                minHeight: 60,
                border: isUnsectionedDropTarget ? '2px dashed #1890ff' : '2px dashed #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '16px 0',
                backgroundColor: isUnsectionedDropTarget ? '#f0f9ff' : '#fafafa'
              }}
              onDragOver={handleUnsectionedDragOver}
              onDragLeave={handleUnsectionedDragLeave}
              onDrop={handleUnsectionedDrop}
            >
              <span style={{ color: '#8c8c8c' }}>
                {isUnsectionedDropTarget ? 'Drop to remove from section' : 'Unsectioned Questions Area'}
              </span>
            </div>
          )}
        </div>
      );
    }
  
    // When sections exist and are enabled
    const unsectionedQuestions = questionsList.filter(
      question => !getSectionForQuestion(question[1])
    );

    return (
      <div className="sectioned-form">
        {/* Render unsectioned questions first */}
        {unsectionedQuestions.length > 0 && (
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              border: isUnsectionedDropTarget ? '2px dashed #1890ff' : '1px solid #f0f0f0',
              borderRadius: 8,
              backgroundColor: isUnsectionedDropTarget ? '#f0f9ff' : '#fafafa'
            }}
            onDragOver={handleUnsectionedDragOver}
            onDragLeave={handleUnsectionedDragLeave}
            onDrop={handleUnsectionedDrop}
          >
            <h4 style={{ margin: '0 0 16px 0', color: '#8c8c8c' }}>
              Unsectioned Questions
              {isUnsectionedDropTarget && <span> - Drop here to remove from section</span>}
            </h4>
            <Reorder.Group
              values={unsectionedQuestions}
              onReorder={(reordered) => {
                // Update the main questions list while preserving sectioned questions
                const sectionedQuestions = questionsList.filter(
                  q => getSectionForQuestion(q[1])
                );
                updateQuestionsList([...reordered, ...sectionedQuestions]);
              }}
              className="reorder-group"
            >
              <div>
                {unsectionedQuestions.map((question, idx) => (
                  <DraggableQuestionItem
                    key={question[1]}
                    question={question}
                    onEdit={editQuestion}
                    onReorderKey={onReorderKey}
                    firstQuestion={idx === 0}
                    lastQuestion={idx === unsectionedQuestions.length - 1}
                  />
                ))}
              </div>
            </Reorder.Group>
          </div>
        )}

        {/* Render each section with its questions */}
        {sections.map((section) => {
          const sectionQuestions = questionsList.filter(
            question => getSectionForQuestion(question[1]) === section.id
          );
  
          return (
            <Section 
              key={section.id} 
              section={section}
            >
              {sectionQuestions.length === 0 ? (
                <Empty 
                  description="No questions in this section. Drag questions here or add new ones."
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              ) : (
                <Reorder.Group
                  values={sectionQuestions}
                  onReorder={(reordered) => {
                    // Update the main questions list while preserving other questions
                    const reorderedIds = new Set(reordered.map(q => q[1]));
                    const remainingQuestions = questionsList.filter(
                      q => !reorderedIds.has(q[1])
                    );
                    updateQuestionsList([...reordered, ...remainingQuestions]);
                  }}
                  className="reorder-group"
                >
                  <div>
                    {sectionQuestions.map((question, idx) => (
                      <DraggableQuestionItem
                        key={question[1]}
                        question={question}
                        onEdit={editQuestion}
                        onReorderKey={onReorderKey}
                        firstQuestion={idx === 0}
                        lastQuestion={idx === sectionQuestions.length - 1}
                      />
                    ))}
                  </div>
                </Reorder.Group>
              )}
            </Section>
          );
        })}
        <div ref={bottomElementRef}></div>
      </div>
    );
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
        renderQuestions()
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