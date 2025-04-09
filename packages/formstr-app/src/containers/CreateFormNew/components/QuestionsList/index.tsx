import QuestionCard from "../QuestionCard";
import { Button, Input } from "antd";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { ChangeEvent, useState, useRef } from "react";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Field } from "../../../../nostr/types";

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

  const {
    formSettings,
    questionsList,
    editQuestion,
    setQuestionIdInFocus,
    updateFormSetting,
    updateQuestionsList,
    setIsLeftMenuOpen,
    bottomElementRef,
    // shouldShowQuestion
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
      questions[selectedQuestionIndex + order] =
        questions[selectedQuestionIndex];
      questions[selectedQuestionIndex] = replaceQuestion;
    }
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
            />
          </div>
        </DescriptionStyle>
      </div>
      <Reorder.Group
        values={questionsList}
        onReorder={updateQuestionsList}
        className="reorder-group"
      >
        <div>

        {questionsList.map((question, idx) => {
  // Check if the question should be shown based on conditions
  // if (!shouldShowQuestion(question)) return null;

            return (
              <Reorder.Item
                value={question}
                key={question[1]}
                dragListener={false}
              >
                <QuestionCard
                  question={question}
                  onEdit={editQuestion}
                  onReorderKey={onReorderKey}
                  firstQuestion={idx === 0}
                  lastQuestion={idx === questionsList.length - 1}
                />
              </Reorder.Item>
            );
          })}
          <div ref={bottomElementRef}></div>
        </div>
      </Reorder.Group>
      <div className="mobile-add-btn">
        <FloatingButton
          onClick={onPlusButtonClick}
          containerRef={containerRef}
        />
      </div>
    </StyleWrapper>
  );
};
