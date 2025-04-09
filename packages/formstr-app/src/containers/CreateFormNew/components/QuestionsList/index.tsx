import React, { ChangeEvent, useState, useRef } from "react"; 
import QuestionCard from "../QuestionCard";
import { Button, Input, App, message } from "antd"; 
import { LLMFormGenerator, GeneratedFormData, FormFieldData } from "../LLMFormGenerator";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { IAnswerSettings } from "../AnswerSettings/types";
import { makeTag } from "../../../../utils/utility";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Field, Tag as NostrTag } from "../../../../nostr/types"; 

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
                position: 'fixed', 
                right: '30px',
                bottom: '30px',
                zIndex: 1000,
                cursor: 'grab'
            }}
            whileTap={{ cursor: 'grabbing' }}
            whileDrag={{ scale: 1.1 }}
            whileHover={{ scale: 1.05 }}
        >
            <Button
                type="primary"
                shape="circle" 
                size="large"
                icon={<span style={{ fontSize: '24px', lineHeight: '0' }}>+</span>}
                onClick={() => {
                    if (!isDragging) onClick();
                }}
                style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            />
        </motion.div>
    );
};

function getPrimitiveFromRenderElement(renderElement: AnswerTypes): string {
    switch (renderElement) {
        case AnswerTypes.shortText:
        case AnswerTypes.paragraph:
        case AnswerTypes.date:
        case AnswerTypes.time:
            return "text";
        case AnswerTypes.number:
            return "number";
        case AnswerTypes.radioButton:
        case AnswerTypes.checkboxes:
        case AnswerTypes.dropdown:
            return "option";
        case AnswerTypes.label:
            return "label";
        default:
            console.warn(`Unhandled AnswerType: ${renderElement}`);
            return "text"; 
    }
}

export const QuestionsList = () => {
    const { message: messageApi } = App.useApp(); 
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

    const AI_TYPE_TO_ANSWER_TYPE_MAP: { [key: string]: AnswerTypes } = {
        'ShortText': AnswerTypes.shortText,
        'LongText': AnswerTypes.shortText,
        'Number': AnswerTypes.number,
        'Email': AnswerTypes.shortText,
        'Date': AnswerTypes.date,
        'Time': AnswerTypes.time,
        'MultipleChoice': AnswerTypes.radioButton,
        'Checkbox': AnswerTypes.checkboxes,
        'Dropdown': AnswerTypes.dropdown,
    };

    const onReorderKey = (keyType: "UP" | "DOWN", tempId: string) => {
        const questions = [...questionsList];
        const selectedQuestionIndex = questions.findIndex(
            (question: Field) => question[1] === tempId
        );
        if (selectedQuestionIndex === -1) return;

        const targetIndex = keyType === "UP" ? selectedQuestionIndex - 1 : selectedQuestionIndex + 1;

        if (targetIndex < 0 || targetIndex >= questions.length) {
            return;
        }

        [questions[selectedQuestionIndex], questions[targetIndex]] = [questions[targetIndex], questions[selectedQuestionIndex]];

        updateQuestionsList(questions);
    };

    const onPlusButtonClick = () => {
        setIsLeftMenuOpen(true);
    };

    const handleAIFormGenerated = (formData: GeneratedFormData) => {
        console.log("AI Generated Data Received in QuestionsList:", formData);
        try {
            updateFormName(formData.title);
            updateFormSetting({ description: formData.description || "" });

            const mappedFields: Field[] = formData.fields.map((aiField): Field => {
                const uniqueId = makeTag(6);
                const fieldType = aiField.type;
                const label = aiField.label;
                const options = Array.isArray(aiField.options) ? aiField.options : [];

                const defaultSettings: IAnswerSettings = {
                    renderElement: AI_TYPE_TO_ANSWER_TYPE_MAP[fieldType] || AnswerTypes.shortText,
                    required: aiField.required || false,
                    validationRules: {},
                };

                const primitiveType = getPrimitiveFromRenderElement(defaultSettings.renderElement as AnswerTypes);

                const mappedOptions = options.map(optionLabel => [
                    makeTag(6),
                    optionLabel,
                    JSON.stringify({})
                ]);

                const newField: Field = [
                    "field", uniqueId, primitiveType, label,
                    JSON.stringify(mappedOptions), JSON.stringify(defaultSettings)
                ];
                return newField;
            });

            updateQuestionsList(mappedFields);
            setQuestionIdInFocus(undefined);
            setShowAIGenerator(false);
            messageApi.success("Form generated successfully from description!");

        } catch (error) {
            console.error("Error processing AI generated form data:", error);
            messageApi.error("Failed to process the generated form data.");
        }
    };

    return (
        <StyleWrapper
            className="main-content"
            onClick={() => setQuestionIdInFocus(undefined)} 
            ref={containerRef}
            style={{ position: "relative", minHeight: 'calc(100vh - 67px)' }}
        >
            <div style={{ padding: '10px 0', textAlign: 'center' }}>
                <Button
                    onClick={() => setShowAIGenerator(prev => !prev)}
                    icon={<span role="img" aria-label="sparkles">✨</span>}
                >
                    {showAIGenerator ? 'Cancel AI Generation' : 'Create with AI'}
                </Button>
            </div>

            {showAIGenerator && (
                <div style={{ marginBottom: '20px', padding: '0 10px' }}>
                    <LLMFormGenerator onFormGenerated={handleAIFormGenerated} />
                </div>
            )}


            {!showAIGenerator && (
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
            )}

            {!showAIGenerator && questionsList.length > 0 && (
                <Reorder.Group
                    axis="y" 
                    values={questionsList}
                    onReorder={updateQuestionsList}
                    className="reorder-group"
                >
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
                </Reorder.Group>
            )}

            <div ref={bottomElementRef} style={{ height: '1px' }}></div>

            <div className="mobile-add-btn"> 
                <FloatingButton
                    onClick={onPlusButtonClick}
                    containerRef={containerRef} 
                />
            </div>

        </StyleWrapper>
    );
};