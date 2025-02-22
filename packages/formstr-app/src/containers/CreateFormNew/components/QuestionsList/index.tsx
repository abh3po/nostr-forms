import QuestionCard from "../QuestionCard";
import { Button, Input, Empty } from "antd";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { ChangeEvent, useState, useRef } from "react";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Field } from "../../providers/FormBuilder";
import Section from "../SectionManager/Section";

interface FloatingButtonProps {
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const FloatingButton = ({ onClick, containerRef }: FloatingButtonProps) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={containerRef}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
      }}
      animate={position}
      whileDrag={{ scale: 1.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Button
        type="primary"
        size="large"
        onClick={() => {
          if (!isDragging) onClick();
        }}
      >
        +
      </Button>
    </motion.div>
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
    if (
      (selectedQuestionIndex === 0 && keyType === "UP") ||
      (selectedQuestionIndex === questions.length - 1 && keyType === "DOWN")
    ) {
      return;
    }
    const order = keyType === "UP" ? -1 : +1;
    if (selectedQuestionIndex !== -1) {
      const replaceQuestion = questions[selectedQuestionIndex + order];
      questions[selectedQuestionIndex + order] = questions[selectedQuestionIndex];
      questions[selectedQuestionIndex] = replaceQuestion;
    }
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
    // If no sections, render questions as usual
    if (!sections || sections.length === 0) {
      return (
        <Reorder.Group
          values={questionsList}
          onReorder={updateQuestionsList}
          className="reorder-group"
        >
          <div>
            {questionsList.map((question, idx) => (
              <Reorder.Item
                value={question}
                key={question[1]}
                dragListener={true}
              >
                <QuestionCard
                  question={question}
                  onEdit={editQuestion}
                  onReorderKey={onReorderKey}
                  firstQuestion={idx === 0}
                  lastQuestion={idx === questionsList.length - 1}
                />
              </Reorder.Item>
            ))}
            <div ref={bottomElementRef}></div>
          </div>
        </Reorder.Group>
      );
    }
  
    // When sections exist, all questions should be in sections
    return (
      <div className="sectioned-form">
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
                  description="No questions in this section"
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              ) : (
                <Reorder.Group
                  values={sectionQuestions}
                  onReorder={(reordered) => {
                    // Update the main questions list while preserving section assignments
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
                      <Reorder.Item
                        value={question}
                        key={question[1]}
                        dragListener={true}
                      >
                        <QuestionCard
                          question={question}
                          onEdit={editQuestion}
                          onReorderKey={onReorderKey}
                          firstQuestion={idx === 0}
                          lastQuestion={idx === sectionQuestions.length - 1}
                          sections={sections}
                          onMoveToSection={(sectionId) => 
                            moveQuestionToSection(question[1], sectionId)
                          }
                        />
                      </Reorder.Item>
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
      style={{ position: 'relative' }}
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
            />
          </div>
        </DescriptionStyle>
      </div>
      
      {renderQuestions()}
      
      <div className="mobile-add-btn">
        <FloatingButton 
          onClick={onPlusButtonClick} 
          containerRef={containerRef}
        />
      </div>
    </StyleWrapper>
  );
};