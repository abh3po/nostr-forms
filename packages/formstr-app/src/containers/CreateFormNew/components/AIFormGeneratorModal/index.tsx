import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Divider, message, Space, Alert } from 'antd';
import { ollamaService, OllamaModel, OllamaConfig } from '../../../../services/ollamaService'; 
import { processOllamaFormData, ProcessedFormData } from '../../../../utils/aiProcessor'; 
import { CREATE_FORM_TOOL_SCHEMA, CREATE_FORM_SYSTEM_PROMPT } from '../../../../constants/prompts'; 
import { AIFormGeneratorModalProps } from './types';
import OllamaSettings from './OllamaSettings';
import ModelSelector from './ModelSelector';
import GenerationPanel from './GenerationPanel';
import ConnectionStatusDisplay from './ConnectionStatusDisplay'; 

const AIFormGeneratorModal: React.FC<AIFormGeneratorModalProps> = ({
    isOpen,
    onClose,
    onFormGenerated,
}) => {
    const [config, setConfig] = useState<OllamaConfig>(ollamaService.getConfig());
    const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [fetchModelsLoading, setFetchModelsLoading] = useState<boolean>(false);
    const [testConnectionLoading, setTestConnectionLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>('');
    const [generationLoading, setGenerationLoading] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const currentConfig = ollamaService.getConfig();
            setConfig(currentConfig);
            setConnectionStatus(null);
            setConnectionError(null);
            setAvailableModels([]); 
            setGenerationError(null);
            handleTestAndFetch();
        }
    }, [isOpen]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, baseUrl: e.target.value }));
        setConnectionStatus(null);
        setConnectionError(null);
    };

    const handleModelChange = (newModel: string) => {
        setConfig(prev => ({ ...prev, modelName: newModel }));
        ollamaService.setConfig({ modelName: newModel }); 
    };

    const handleTestAndFetch = useCallback(async (urlToTest?: string) => {
        const effectiveUrl = urlToTest ?? config.baseUrl; 
        console.log(`Testing and fetching for URL: ${effectiveUrl}`);
        setTestConnectionLoading(true);
        setFetchModelsLoading(true); 
        setConnectionStatus(null);
        setConnectionError(null);
        setAvailableModels([]);
        if (urlToTest) {
             ollamaService.setConfig({ baseUrl: urlToTest });
        }
        const connectionResult = await ollamaService.testConnection();
        setConnectionStatus(connectionResult.success);
        setConnectionError(connectionResult.error || null);
        setTestConnectionLoading(false);
        
        if (connectionResult.success) {
            const modelsResult = await ollamaService.fetchModels();
            if (modelsResult.success && modelsResult.models) {
                setAvailableModels(modelsResult.models);
                const currentConfig = ollamaService.getConfig(); 
                setConfig(currentConfig); 
                if (modelsResult.models.length > 0 && !modelsResult.models.some(m => m.name === currentConfig.modelName)) {
                     message.info(`Current model unavailable, switched to ${currentConfig.modelName}`);
                } else if (modelsResult.models.length === 0) {
                     message.warning("Connected to Ollama, but no models found.");
                }
            } else {
                setConnectionError(modelsResult.error || "Failed to fetch models after successful connection.");
                setAvailableModels([]); 
            }
        } else {
            setAvailableModels([]); 
        }
        setFetchModelsLoading(false);
    }, [config.baseUrl]); 

     const handleUrlBlur = () => {
        handleTestAndFetch(config.baseUrl);
        ollamaService.setConfig({ baseUrl: config.baseUrl });
     };
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            message.error('Please enter a description for the form.');
            return;
        }
        if (!connectionStatus) {
             message.error('Cannot generate form. Please ensure connection to Ollama server.');
             return;
        }
         if (!config.modelName || availableModels.length === 0) {
             message.error('Cannot generate form. Please select a valid model.');
             return;
        }

        setGenerationLoading(true);
        setGenerationError(null);
        const generationParams = {
            prompt: prompt,
            systemPrompt: CREATE_FORM_SYSTEM_PROMPT, 
            tools: [
                {
                    type: 'function' as const,
                    function: {
                        name: 'create_form_structure',
                        description: 'Generates the JSON structure for a web form based on a description.',
                        parameters: CREATE_FORM_TOOL_SCHEMA, 
                    },
                }
            ]
        };

        const result = await ollamaService.generateForm(generationParams);
        if (result.success && result.data) {
            try {
                const processedData = processOllamaFormData(result.data);
                onFormGenerated(processedData); 
                message.success('Form generated successfully!');
                onClose(); 
            } catch (processingError: any) {
                 console.error("Error processing AI response:", processingError);
                 setGenerationError(`Failed to process AI response: ${processingError.message}`);
                 message.error('Failed to process the generated form data.');
            }
        } else {
            setGenerationError(result.error || 'An unknown error occurred during generation.');
            message.error(result.error || 'Failed to generate form.');
        }
        setGenerationLoading(false);
    };

    return (
        <Modal
            title="Create Form with AI"
            open={isOpen}
            onCancel={onClose}
            footer={null} 
            width={700}
            destroyOnClose 
            maskClosable={!generationLoading} 
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <OllamaSettings
                    ollamaUrl={config.baseUrl}
                    onUrlChange={handleUrlChange}
                    onTestConnection={handleUrlBlur} 
                    onSaveSettings={() => ollamaService.setConfig(config)} 
                    loading={testConnectionLoading}
                />
                <ModelSelector
                     model={config.modelName}
                     setModel={handleModelChange}
                     availableModels={availableModels}
                     fetchingModels={fetchModelsLoading}
                     fetchModels={() => handleTestAndFetch()} 
                     disabled={!connectionStatus} 
                 />
                 <ConnectionStatusDisplay
                      loading={testConnectionLoading || fetchModelsLoading}
                      connectionStatus={connectionStatus}
                      error={connectionError}
                      modelCount={availableModels.length}
                 />
                <Divider style={{ margin: '0' }}/>
                <GenerationPanel
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onGenerate={handleGenerate}
                    loading={generationLoading}
                    disabled={!connectionStatus || availableModels.length === 0 || generationLoading}
                />
                 {generationError && (
                      <Alert message={`Generation Error: ${generationError}`} type="error" showIcon />
                 )}
            </Space>
        </Modal>
    );
};

export default AIFormGeneratorModal;