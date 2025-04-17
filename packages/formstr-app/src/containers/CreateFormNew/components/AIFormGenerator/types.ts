import { OllamaModel } from "../../services/ollamaService";
import { IFormSettings } from "../FormSettings/types";

export interface FormTypeOption {
  value: string;
  label: string;
}

export interface OllamaSettingsProps {
  ollamaUrl: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTestConnection: () => void;
  onSaveSettings: () => void;
  loading: boolean;
  connectionStatus: boolean | null;
}

export interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
  availableModels: OllamaModel[];
  fetchingModels: boolean;
  fetchModels: () => void;
}

export interface ConnectionStatusProps {
  loading: boolean;
  connectionStatus: boolean | null;
  availableModels: OllamaModel[];
  error: string | null;
}

export interface FormGenerationPanelProps {
  formType: string;
  setFormType: (type: string) => void;
  formTypes: FormTypeOption[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  loading: boolean;
  disabled: boolean;
  error: string | null;
}

export interface ResponsePreviewProps {
  loading: boolean;
  generationResponse: string | null;
  error: string | null;
}

export interface AIProcessingProps {
  formSettings: IFormSettings;
  updateFormSetting: (settings: IFormSettings) => void;
  updateQuestionsList: (fields: any[]) => void;
  updateFormName: (name: string) => void;
}