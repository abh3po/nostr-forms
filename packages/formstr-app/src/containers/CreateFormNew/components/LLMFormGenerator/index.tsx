import React, { useState, useEffect } from 'react';
import { generateJsonWithOllama } from '../../../../utils/ollama';
import { OLLAMA_FORM_GENERATION_PROMPT_TEMPLATE } from '../../../../constants/prompts';
import { Button, Input, message, Typography, Divider } from 'antd'
import { getItem, setItem, LOCAL_STORAGE_KEYS } from '../../../../utils/localStorage';

const { Text } = Typography;
export interface FormFieldData {
    id: string; 
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
}

export interface GeneratedFormData {
    title: string;
    description?: string;
    fields: FormFieldData[];
}

interface LLMFormGeneratorProps {
    onFormGenerated: (formData: GeneratedFormData) => void; 
}


function isValidGeneratedFormData(data: any): data is GeneratedFormData {
    if (!data || typeof data !== 'object') {
        console.error("Validation Error: Response is not an object.", data);
        return false;
    }
    if (typeof data.title !== 'string' || data.title.trim() === '') {
        console.error("Validation Error: Missing or empty 'title'.", data);
        return false;
    }
    if (data.description && typeof data.description !== 'string') {
        console.error("Validation Error: 'description' exists but is not a string.", data);
        return false;
    }
    if (!Array.isArray(data.fields)) {
        console.error("Validation Error: 'fields' is not an array.", data);
        return false;
    }
    for (const field of data.fields) {
        if (!field || typeof field !== 'object' || typeof field.label !== 'string' || typeof field.type !== 'string') {
            console.error("Validation Error: A field is missing required properties (label, type).", field);
        }
        if ((field.type === 'MultipleChoice' || field.type === 'Checkbox' || field.type === 'Dropdown') && !Array.isArray(field.options)) {
             console.warn("Validation Warning: Choice field is missing 'options' array.", field);
        }
    }
    return true; 
}


export const LLMFormGenerator: React.FC<LLMFormGeneratorProps> = ({ onFormGenerated }) => {
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [ollamaUrlInput, setOllamaUrlInput] = useState<string>('');
    const [ollamaModelInput, setOllamaModelInput] = useState<string>('');

    useEffect(() => {
        const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_URL, { parseAsJson: false });
        setOllamaUrlInput(storedUrl || 'http://localhost:11434'); // Default URL
        const storedModel = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, { parseAsJson: false });
        setOllamaModelInput(storedModel || 'llama3'); // Default model
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

        const fullPrompt = OLLAMA_FORM_GENERATION_PROMPT_TEMPLATE + JSON.stringify(description);


;

        generateJsonWithOllama<GeneratedFormData>(fullPrompt) 
            .then(parsedData => {
                 console.log("Raw data received from Ollama parser:", parsedData);
                 if (isValidGeneratedFormData(parsedData)) {
                     console.log("Validation successful. Calling onFormGenerated.");
                     onFormGenerated(parsedData);
                 } else {
                     throw new Error("Received invalid or incomplete form structure from AI. Please try rephrasing your description or check the Ollama model.");
                 }
                 setIsLoading(false); 
            })
            .catch(err => {
                 console.error("Error during AI form generation:", err);
                 if (err instanceof Error) {
                     setError(err.message); 
                 } else {
                     setError("An unknown error occurred during form generation."); 
                 }
                 setIsLoading(false); 
            })
            .finally(() => setIsLoading(false));
    };

    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            padding: '15px',
            border: '1px solid #eee',
            borderRadius: '8px',
            // margin: '10px 0',
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
        loading: {
            marginTop: '10px',
            fontStyle: 'italic',
            color: '#555',
        },
        error: {
            marginTop: '10px',
            color: '#dc3545', 
            fontWeight: 'bold',
            padding: '8px',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
        },
        settingInputDiv: { 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch', 
            gap: '5px', 
            marginBottom: '10px' 
        },
        settingHelpText: { 
            fontSize: '0.8em', 
            marginTop: '3px' 
        },
    };

    // --- Render JSX ---
    return (
        <div style={styles.container}>
            <label htmlFor="form-description-ai" style={styles.label}>
                Describe the form you want to create:
            </label>
            <textarea
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
                    size="middle" // Optional: Keep consistent sizing
                    disabled={isLoading} // Disable while generating
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
                    size="middle" // Optional: Keep consistent sizing
                    disabled={isLoading} // Disable while generating
                />
                <Text type="secondary" style={styles.settingHelpText}>E.g., llama3, mistral, helper</Text>
            </div>

            <Divider /> {/* --- Add Divider --- */}

            <Button
            type="primary" 
            onClick={handleGenerateClick}
            disabled={isLoading || description.trim() === ''}
            loading={isLoading}
            style={{ marginTop: '0px', width: '100%' }}
            >
            {isLoading ? 'Generating...' : 'Generate Form with AI'}
            </Button>

            {isLoading && (
                <div style={styles.loading}>Communicating with AI assistant... Please wait.</div>
            )}

            {error && (
                <div style={styles.error}>Error: {error}</div>
            )}
        </div>
    );
};
