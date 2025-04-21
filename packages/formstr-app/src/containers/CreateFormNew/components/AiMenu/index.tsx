import { Menu, Modal, Input, Button, message, Spin } from "antd";
import { useState, ChangeEvent } from "react";
import { AI_MENU } from "../../configs/menuConfig";
import { AI_MENU_KEYS } from "../../configs/constants";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { generateFormFromPrompt, FormField } from "../../../services/OllamaService";
import {generateQuestion} from "../../utils" ;


function AiMenu() {
  const { addQuestion,updateQuestionsList, questionsList } = useFormBuilderContext();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const showModal = (): void => {
    setIsModalVisible(true);
  };

  const handleCancel = (): void => {
    setIsModalVisible(false);
    setPrompt("");
  };

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  const processAIResponse = (fields: FormField[]): void => {
    console.log("Raw AI Response Fields:", JSON.stringify(fields, null, 2));
      
    if (!Array.isArray(fields)) {
      message.error("Invalid response format from AI");
      return;
    }
  
    const getMatchingAnswerType = (inputType: string): AnswerTypes => {
      // Direct mapping for common field types
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
        "country": AnswerTypes.country,
      };
      
      const lowerType = inputType.toLowerCase();
      
      // Try direct mapping first
      if (typeMap[lowerType]) {
        return typeMap[lowerType];
      }
      
      // Try to find a matching key in the map
      for (const [key, value] of Object.entries(typeMap)) {
        if (lowerType.includes(key) || key.includes(lowerType)) {
          return value;
        }
      }
      
      // Default to shortText if no match found
      return AnswerTypes.shortText;
    };
  
    // Process all fields and create new questions
    let choices: string[][] = [];
    const newQuestions = fields.map((field: FormField) => {
      // Get the appropriate render element type
      const renderElement = getMatchingAnswerType(field.type);
      
      // Determine the primitive type
      let primitive: string;
      
      if (renderElement === AnswerTypes.number) {
        primitive = "number";
      } else if ([
        AnswerTypes.radioButton, 
        AnswerTypes.checkboxes, 
        AnswerTypes.dropdown,
        AnswerTypes.country
      ].includes(renderElement)) {
        primitive = "option";
      } else {
        primitive = "text";
      }
      
      // Prepare answer settings
      let answerSettings: any = {
        renderElement: renderElement
      };
     
      // Add choices for option-based fields
      if (primitive === "option" && field.options && Array.isArray(field.options)) {
      
        choices = field.options.map(option => ["", option]);
      }
      
      console.log("primitive: " + primitive + ", label: " + field.label);
      console.log("answerSettings:", JSON.stringify(answerSettings, null, 2));
      
      return { primitive, label: field.label, answerSettings };
    });
  
    
    // Get current questions and generate new ones
    
    const allNewQuestions = newQuestions.map(({ primitive, label, answerSettings }) => 
      generateQuestion(primitive, label, choices, answerSettings)
    );
    
    // Update with all questions at once (current + new)
    updateQuestionsList([...questionsList, ...allNewQuestions]);
  };


  const handleCreateForm = async (): Promise<void> => {
    if (!prompt.trim()) {
      message.error("Please enter a prompt");
      return;
    }

    setLoading(true);

    try {
      // Use the Ollama service to generate the form
      const response = await generateFormFromPrompt(prompt);
      
      if (response && response.fields) {
        processAIResponse(response.fields);
        message.success("Form generated successfully!");
        setIsModalVisible(false);
        setPrompt("");
      } else {
        message.error("Invalid response format. Please try again.");
      }
    } catch (error: any) {
      message.error("Failed to generate form: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onMenuClick = ({ key }: { key: string }): void => {
    if (key === AI_MENU_KEYS.CREATE_FORM) {
      showModal();
    } else if (key === AI_MENU_KEYS.FILL_FORM) {
      // Handle Fill Form option (to be implemented later)
      message.info("Fill Form feature will be implemented soon.");
    }
  };

  return (
    <div>
      <Menu 
        selectedKeys={[]} 
        items={[{ 
          key: "AI", 
          label: "AI", 
          children: AI_MENU, 
          type: "group" 
        }]} 
        onClick={onMenuClick} 
      />
      
      <Modal
        title="Create Form with AI"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleCreateForm}
          >
            Generate Form
          </Button>
        ]}
      >
        <p>Enter a description of the form you want to create:</p>
        <Input.TextArea
          rows={4}
          value={prompt}
          onChange={handlePromptChange}
          placeholder="e.g., Create a contact form with name, email, and message fields"
        />
        {loading && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Spin tip="Generating form with AI..." />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AiMenu;

// create a form asking user name,age, address, country and which app they use most. options for apps are x,youtube,brave,google,Instagram.