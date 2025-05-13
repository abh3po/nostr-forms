import { Button, Divider, Input, message, Modal, Spin , Typography} from "antd";
import { useEffect, useState } from "react";
const { Text } = Typography;
import {generateQuestion} from "../../utils" ;
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { generateForm} from "../../../../../src/AI/ollama/generateForm";
import { FormField } from "../../../../../src/nostr/types";


export default function AIForm() {
    const { updateQuestionsList , updateFormName , updateFormSetting } = useFormBuilderContext();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [ollamaUrl, setOllamaUrl] = useState<string>("");
    const [ollamaModel, setOllamaModel] = useState<string>(""); 
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>("");


    useEffect(() => {
        setOllamaUrl("http://localhost:11434/");
        setOllamaModel("llama3.2");
    }, []);
    
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };
    const handleOpenModel = () => {
        setIsModalOpen(true);
    };
    const handleCloseModel = () => {
        setIsModalOpen(false);
    };

    const handleGenerateClick = async () => {
        if(prompt.trim() === '') {
            setError("Please enter a description for the form");
            return;
        }
        setError(null);
        setIsLoading(true);
        
        try {
            const response = await generateForm(prompt, ollamaUrl, ollamaModel);
            if(response){
                processResponse(response);
                message.success("Form generated successfully");
                setIsModalOpen(false);
                setPrompt("");
            } else {
                setError("Error generating form");
            }
        } catch (error : any) {
            setError(error.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    const processResponse = (response: any): void => {
        const { fields, formName, description } = response;
        if (!Array.isArray(fields)) {
          message.error("Invalid response format from AI");
          return;
        }
      
        const getMatchingAnswerType = (inputType: string): AnswerTypes => {
          const typeMap: Record<string, AnswerTypes> = {
            "shortText": AnswerTypes.shortText,
            "text": AnswerTypes.shortText,
            "paragraph": AnswerTypes.paragraph,
            "number": AnswerTypes.number,
            "radio": AnswerTypes.radioButton,
            "radiobutton": AnswerTypes.radioButton,
            "checkbox": AnswerTypes.checkboxes,
            "checkboxes": AnswerTypes.checkboxes,
            "dropdown": AnswerTypes.dropdown,
            "select": AnswerTypes.dropdown,
            "date": AnswerTypes.date,
            "time": AnswerTypes.time,
          };
          
          const lowerType = inputType.toLowerCase();

          if (typeMap[lowerType]) {
            return typeMap[lowerType];
          }

          for (const [key, value] of Object.entries(typeMap)) {
            if (lowerType.includes(key) || key.includes(lowerType)) {
              return value;
            }
          }

          return AnswerTypes.shortText; // default to short text
        };

        let choices: string[][] = [];
        const newQuestions = fields.map((field: FormField) => {
          const renderElement = getMatchingAnswerType(field.type);

          let primitive: string;
          
          if (renderElement === AnswerTypes.number) {
            primitive = "number";
          } else if ([
            AnswerTypes.radioButton, 
            AnswerTypes.checkboxes, 
            AnswerTypes.dropdown,
          ].includes(renderElement)) {
            primitive = "option";
          } else {
            primitive = "text";
          }

          let answerSettings: any = {
            renderElement: renderElement
          };

          if (primitive === "option" && field.options && Array.isArray(field.options)) {
          
            choices = field.options.map((option: any) => ["", option]);
          }        
          return { primitive, label: field.label, answerSettings };
        });
      
        const allNewQuestions = newQuestions.map(({ primitive, label, answerSettings }) => 
          generateQuestion(primitive, label, choices, answerSettings)
        );
        updateQuestionsList([...allNewQuestions]);
        updateFormName(formName);
        updateFormSetting({description: description});
      };
      const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleGenerateClick();
        }
      };
  
    return (
        <>
            <div style={{ padding: "10px 0", textAlign: "center" , marginTop: '10px' , marginBottom: '-10px', fontSize: '20px' }}>
                <Button
                onClick={handleOpenModel}
                icon={<span role="img" aria-label="sparkles">✨</span>}
                >
                Generate with AI
                </Button>
            </div>

            <Modal
                title="AI Form Generator"
                open={isModalOpen}
                onCancel={handleCloseModel}
                width={800}
                footer={null}
                destroyOnClose={true}
            >
                <label htmlFor="form-description-ai" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                Describe the form you want to create:
                </label>
                <Input.TextArea
                    id="form-description-ai"
                    value={prompt}
                    onChange={handlePromptChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., A simple contact form with name, email, and message fields. Make email required. Make sure to include the fields in the form."
                    rows={4}
                    style={{width: '100%', minHeight: '80px',marginBottom: '10px'}}
                    disabled={isLoading} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '5px', marginBottom: '10px' }}>
                    <Text style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>LLM Server URL</Text>
                    <Input
                        placeholder="http://localhost:11434"
                        value={ollamaUrl}
                        onChange={(e) => setOllamaUrl(e.target.value)}
                        disabled={isLoading} 
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '5px', marginBottom: '10px' }}>
                    <Text style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>LLM Model</Text>
                    <Input
                        placeholder="llama3"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        disabled={isLoading} 
                    />
                </div>
                <Divider />
                <Button
                    type="primary"
                    onClick={handleGenerateClick}
                    disabled={prompt.trim() === '' || isLoading}
                    loading={isLoading} 
                    style={{ marginTop: '0px', width: '100%' }}
                    >
                    {isLoading ? 'Generating...' : 'Generate Form'}
                </Button>
                {isLoading && (
                <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#555', textAlign: 'center' }}>
                    <Spin /> Hold on, AI is generating your form...
                </div>
                )}
                {error && (
                    <div style={{ marginTop: '10px', color: '#dc3545', fontWeight: 'bold', padding: '8px', border: '1px solid #f5c6cb', borderRadius: '4px', backgroundColor: '#f8d7da' }}>
                    Error: {error}
                    </div>
                )}
            </Modal>
        </>
    )
}