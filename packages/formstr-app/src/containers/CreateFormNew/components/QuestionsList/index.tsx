import React, { ChangeEvent, useState, useRef } from "react"; // Added React to imports if not already explicitly there
import QuestionCard from "../QuestionCard";
import { Button, Input, App, message } from "antd"; // Added App, message
import { LLMFormGenerator, GeneratedFormData, FormFieldData } from "../LLMFormGenerator";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { IAnswerSettings } from "../AnswerSettings/types";
import { makeTag } from "../../../../utils/utility";
import FormTitle from "../FormTitle";
import StyleWrapper from "./style";
import DescriptionStyle from "./description.style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Field, Tag as NostrTag } from "../../../../nostr/types"; // Renamed Tag to NostrTag

// --- FloatingButton Component Definition (with styling improvements) ---
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
                position: 'fixed', // Make it float
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
                shape="circle" // Standard FAB shape
                size="large"
                icon={<span style={{ fontSize: '24px', lineHeight: '0' }}>+</span>} // Centered '+'
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
// --- End FloatingButton Component Definition ---

// --- Start Helper Function for AI Feature ---
// Helper Function to map AnswerTypes to Primitive Strings
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
            return "text"; // Fallback
    }
}
// --- End Helper Function ---

export const QuestionsList = () => {
    // --- Start AI Feature Hooks/State ---
    const { message: messageApi } = App.useApp(); // Hook for context-aware messages
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    // --- End AI Feature Hooks/State ---

    const containerRef = useRef<HTMLDivElement>(null);

    // Destructure existing and new context values needed
    const {
        formSettings,
        questionsList,
        editQuestion,
        setQuestionIdInFocus,
        updateFormSetting,
        updateQuestionsList,
        setIsLeftMenuOpen,
        bottomElementRef,
        updateFormName, // Needed for AI feature
    } = useFormBuilderContext();

    // --- Original handleDescriptionChange ---
    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        updateFormSetting({ description: e.target.value });
    };

    // --- Original onReorderKey ---
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

    // --- Original onPlusButtonClick ---
    const onPlusButtonClick = () => {
        setIsLeftMenuOpen(true);
    };

    // --- Start AI Feature Handler Function ---
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

                const renderElement: AnswerTypes =
                    fieldType === 'ShortText' ? AnswerTypes.shortText :
                    fieldType === 'LongText' ? AnswerTypes.paragraph :
                    fieldType === 'Number' ? AnswerTypes.number :
                    fieldType === 'Email' ? AnswerTypes.shortText :
                    fieldType === 'Date' ? AnswerTypes.date :
                    fieldType === 'Time' ? AnswerTypes.time :
                    fieldType === 'MultipleChoice' ? AnswerTypes.radioButton :
                    fieldType === 'Checkbox' ? AnswerTypes.checkboxes :
                    fieldType === 'Dropdown' ? AnswerTypes.dropdown :
                    AnswerTypes.shortText;

                const primitiveType = getPrimitiveFromRenderElement(renderElement);

                const defaultSettings: IAnswerSettings = {
                    renderElement: renderElement,
                    required: aiField.required ?? false,
                    validationRules: {},
                };

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
    // --- End AI Feature Handler Function ---

    return (
        <StyleWrapper
            className="main-content"
            onClick={() => setQuestionIdInFocus(undefined)} // Keep original behavior
            ref={containerRef}
            // Add minHeight to ensure constraints work
            style={{ position: "relative", minHeight: 'calc(100vh - 67px)' }}
        >
            {/* --- Start AI Feature UI Elements --- */}
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
            {/* --- End AI Feature UI Elements --- */}


            {/* --- Original Form Title/Description (Conditionally Rendered) --- */}
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
                                placeholder="Add a form description (optional, supports Markdown)" // Added placeholder
                            />
                        </div>
                    </DescriptionStyle>
                </div>
            )}
            {/* --- End Original Form Title/Description --- */}

            {/* --- Original Questions List (Conditionally Rendered) --- */}
            {!showAIGenerator && questionsList.length > 0 && (
                <Reorder.Group
                    axis="y" // Keep vertical reordering
                    values={questionsList}
                    onReorder={updateQuestionsList}
                    className="reorder-group"
                >
                    {/* Render existing questions */}
                    {questionsList.map((question, idx) => (
                        <Reorder.Item
                            value={question}
                            key={question[1]} // Unique ID is crucial
                            dragListener={true}
                        >
                            <QuestionCard
                                question={question}
                                onEdit={editQuestion}
                                onReorderKey={onReorderKey} // Pass the handler
                                firstQuestion={idx === 0}
                                lastQuestion={idx === questionsList.length - 1}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}
            {/* --- End Original Questions List --- */}

            {/* Original bottom ref div */}
            <div ref={bottomElementRef} style={{ height: '1px' }}></div>

            {/* --- Original Mobile Add Button --- */}
            <div className="mobile-add-btn"> {/* Ensure CSS targets this */}
                <FloatingButton
                    onClick={onPlusButtonClick}
                    containerRef={containerRef} // Pass ref for constraints
                />
            </div>
            {/* --- End Original Mobile Add Button --- */}

        </StyleWrapper>
    );
};