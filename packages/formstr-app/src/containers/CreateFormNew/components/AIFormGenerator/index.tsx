import React, { useState, useEffect } from 'react';
import { Divider, Typography, Space } from 'antd';
import { ollamaService } from '../../services/ollamaService';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';
import { StyledContainer } from './styles';
import { FormTypeOption } from './types';
import OllamaSettings from './OllamaSettings';
import ModelSelector from './ModelSelector';
import ConnectionStatus from './ConnectionStatus';
import FormGenerationPanel from './FormGenerationPanel';
import ResponsePreview from './ResponsePreview';
import { processAIResponse } from './AIProcessor';

const { Title } = Typography;

export interface AIFormGeneratorProps {
  className?: string;
  hideSettings?: boolean;
  initialPrompt?: string;
  initialResponse?: string | null;
  initialFormType?: string;
  onFormGenerated?: (prompt: string, response: string, formType: string) => void;
}

const formTypes: FormTypeOption[] = [
  { value: 'survey', label: 'Survey Form' },
  { value: 'contact', label: 'Contact Form' },
  { value: 'registration', label: 'Registration Form' },
  { value: 'feedback', label: 'Feedback Form' },
  { value: 'application', label: 'Application Form' },
  { value: 'event', label: 'Event Registration' },
  { value: 'custom', label: 'Custom Form' },
];

const AIFormGenerator: React.FC<AIFormGeneratorProps> = ({
  className,
  hideSettings = false,
  initialPrompt = '',
  initialResponse = null,
  initialFormType = 'survey',
  onFormGenerated
}) => {
  // Ollama configuration states
  const [ollamaUrl, setOllamaUrl] = useState(ollamaService.getConfig().baseUrl);
  const [model, setModel] = useState(ollamaService.getConfig().model);
  const [availableModels, setAvailableModels] = useState(ollamaService.getAvailableModels());
  const [fetchingModels, setFetchingModels] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Form generation states
  const [prompt, setPrompt] = useState(initialPrompt);
  const [formType, setFormType] = useState(initialFormType);
  const [loading, setLoading] = useState(false);
  const [generationResponse, setGenerationResponse] = useState<string | null>(initialResponse);
  const [error, setError] = useState<string | null>(null);

  const formContext = useFormBuilderContext();

  // Update state when initial props change
  useEffect(() => {
    setPrompt(initialPrompt);
    setGenerationResponse(initialResponse);
    setFormType(initialFormType);
  }, [initialPrompt, initialResponse, initialFormType]);

  // Initial fetch of available models
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setFetchingModels(true);
    try {
      const models = await ollamaService.fetchAvailableModels();
      setAvailableModels(models);

      // If we have models and current selection isn't among them, select first available
      if (models.length > 0) {
        const modelNames = models.map(m => m.name);
        if (!modelNames.includes(model)) {
          setModel(models[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
    } finally {
      setFetchingModels(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOllamaUrl(e.target.value);
  };

  const handleTestConnection = async () => {
    ollamaService.setConfig({ baseUrl: ollamaUrl });
    setConnectionStatus(null);
    setLoading(true);

    try {
      const isConnected = await ollamaService.testConnection();
      setConnectionStatus(isConnected.success);

      if (isConnected.success) {
        // Update available models after successful connection
        const models = ollamaService.getAvailableModels();
        setAvailableModels(models);

        // Update selected model if needed
        if (models.length > 0) {
          const modelNames = models.map(m => m.name);
          if (!modelNames.includes(model)) {
            setModel(models[0].name);
          }
        }
      }
    } catch (error) {
      setConnectionStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    ollamaService.setConfig({ baseUrl: ollamaUrl, model });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setError(null);
    setLoading(true);
    setGenerationResponse(null);

    try {
      const request = {
        prompt,
        formType,
        temperature: 0.7
      };

      const response = await ollamaService.generateForm(request);

      if (response.success && response.fields) {
        // Display the raw response
        const responseStr = JSON.stringify(response.fields, null, 2);
        setGenerationResponse(responseStr);

        // Process the response and update the form
        await processAIResponse(response, prompt, {
          formSettings: formContext.formSettings,
          updateFormSetting: formContext.updateFormSetting,
          updateQuestionsList: formContext.updateQuestionsList,
          updateFormName: formContext.updateFormName
        });
        
        // Notify parent that form was generated successfully
        if (onFormGenerated) {
          onFormGenerated(prompt, responseStr, formType);
        }
      } else {
        setError(response.error || 'Failed to generate form');
        if (response.rawResponse) {
          setGenerationResponse(response.rawResponse);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer className={className}>
      <Title level={4}>AI Form Generator</Title>

      {!hideSettings && (
        <>
          <Divider />
          <Title level={5}>Ollama Settings</Title>
          <OllamaSettings
            ollamaUrl={ollamaUrl}
            onUrlChange={handleUrlChange}
            onTestConnection={handleTestConnection}
            onSaveSettings={handleSaveSettings}
            loading={loading}
            connectionStatus={connectionStatus}
          />

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <ModelSelector
              model={model}
              setModel={setModel}
              availableModels={availableModels}
              fetchingModels={fetchingModels}
              fetchModels={fetchModels}
            />

            <ConnectionStatus
              loading={loading}
              connectionStatus={connectionStatus}
              availableModels={availableModels}
              error={error}
            />
          </Space>
        </>
      )}

      <Divider />
      <Title level={5}>Generate Form</Title>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <FormGenerationPanel
          formType={formType}
          setFormType={setFormType}
          formTypes={formTypes}
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          loading={loading}
          disabled={availableModels.length === 0}
          error={error}
        />

        <ResponsePreview
          loading={loading}
          generationResponse={generationResponse}
          error={error}
        />
      </Space>
    </StyledContainer>
  );
};

export default AIFormGenerator;