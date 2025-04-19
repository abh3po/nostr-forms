import React, { useState, useEffect } from 'react';
import { Button, Input, message, Typography, Divider } from 'antd';
import { getItem, setItem, LOCAL_STORAGE_KEYS } from '../../../../utils/localStorage';
import { Spin } from 'antd'; 
import { generateFormWithOllamaTool } from '../../../../utils/ollama'; 
const { Text } = Typography;
export interface GeneratedFormData {
    title: string;
    description?: string;
    fields: any[]; 
}
interface LLMFormGeneratorProps {
    onFormGenerated: (formData: GeneratedFormData) => void;  
}

export const LLMFormGenerator: React.FC<LLMFormGeneratorProps> = ({ onFormGenerated }) => {
    const [description, setDescription] = useState<string>('');
    const [ollamaUrlInput, setOllamaUrlInput] = useState<string>('');
    const [ollamaModelInput, setOllamaModelInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_URL, { parseAsJson: false });
        setOllamaUrlInput(storedUrl || 'http://localhost:11434');
        const storedModel = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, { parseAsJson: false });
        setOllamaModelInput(storedModel || 'llama3'); 
    }, []); 

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleOllamaUrlSave = () => {
        const urlToSave = ollamaUrlInput.trim();
        if (urlToSave === '' || urlToSave.startsWith('http://') || urlToSave.startsWith('https://')) {
            setItem(LOCAL_STORAGE_KEYS.OLLAMA_URL, urlToSave, { parseAsJson: false });
            message.success("LLM Server URL saved!");
        } else {
            message.error("Invalid URL format. Please include http:// or https://, or leave empty to use default.");
        }
    };

    const handleOllamaModelSave = () => {
        const modelToSave = ollamaModelInput.trim();
        if (modelToSave) { 
          setItem(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, modelToSave, { parseAsJson: false });
          message.success("LLM Model Name saved!");
        } else {
          message.warning("Model name cannot be empty. Reverted to previous or default.");
          const storedModel = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, { parseAsJson: false });
          setOllamaModelInput(storedModel || 'llama3');
        }
    };

    const handleGenerateClick = () => {
        if (description.trim() === '') {
            setError("Please enter a description for the form.");
            return;
        }
        setError(null); 
        setIsLoading(true); 
        generateFormWithOllamaTool(description, ollamaUrlInput, ollamaModelInput)
        .then(parsedArguments => { 
            if (parsedArguments) {
                onFormGenerated(parsedArguments);
            } else {
                setError("Received null arguments from Ollama utility.");
            }
        })
            .catch(err => {
                console.error("Error during AI form generation:", err);
                setError(err.message || "An unknown error occurred.");
            })
            .finally(() => {
                setIsLoading(false); 
            });
    };
 
    const styles: { [key: string]: React.CSSProperties } = {
      container: {
          padding: '15px',
          border: '1px solid #eee',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
      },
      label: {
          display: 'block',
          marginBottom: '5px',
          fontWeight: 'bold',
      },
      textarea: {
          width: '100%',
          minHeight: '80px',
          marginBottom: '10px'
      },
      settingInputDiv: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '5px', marginBottom: '10px' },
      settingHelpText: { fontSize: '0.8em', marginTop: '3px' },
      
    };

    return (
        <div style={styles.container}>
            <label htmlFor="form-description-ai" style={styles.label}>
                Describe the form you want to create:
            </label>
            <Input.TextArea
                id="form-description-ai"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g., A simple contact form with name, email, and message fields. Make email required."
                rows={4}
                style={styles.textarea}
                disabled={isLoading} 
            />
            <div style={styles.settingInputDiv}>
                <Text style={styles.label}>LLM Server URL</Text>
                <Input
                    placeholder="http://localhost:11434"
                    value={ollamaUrlInput}
                    onChange={(e) => setOllamaUrlInput(e.target.value)}
                    onBlur={handleOllamaUrlSave} 
                    disabled={isLoading} 
                />
                 <Text type="secondary" style={styles.settingHelpText}>Default: http://localhost:11434</Text>
            </div>
             <div style={styles.settingInputDiv}>
                <Text style={styles.label}>LLM Model Name</Text>
                <Input
                    placeholder="llama3"
                    value={ollamaModelInput}
                    onChange={(e) => setOllamaModelInput(e.target.value)}
                    onBlur={handleOllamaModelSave} 
                    disabled={isLoading} 
                />
                 <Text type="secondary" style={styles.settingHelpText}>E.g., llama3, mistral, etc.</Text>
            </div>
            <Divider />
            <Button
                type="primary"
                onClick={handleGenerateClick}
                disabled={description.trim() === '' || isLoading}
                loading={isLoading} 
                style={{ marginTop: '0px', width: '100%' }}
                >
                {isLoading ? 'Generating...' : 'Generate Form with AI'}
                Generate Form with AI
            </Button>
            {isLoading && (
    <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#555', textAlign: 'center' }}>
        <Spin /> Communicating with AI assistant... Please wait.
    </div>
)}
{error && (
    <div style={{ marginTop: '10px', color: '#dc3545', fontWeight: 'bold', padding: '8px', border: '1px solid #f5c6cb', borderRadius: '4px', backgroundColor: '#f8d7da' }}>
        Error: {error}
    </div>
)}
        </div>
    );
};