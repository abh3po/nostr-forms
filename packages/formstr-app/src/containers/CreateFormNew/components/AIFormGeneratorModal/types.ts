import { OllamaModel } from '../../../../services/ollamaService'; 
import { ProcessedFormData } from '../../../../utils/aiProcessor'; 
export interface AIFormGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFormGenerated: (processedData: ProcessedFormData) => void;
}
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
}
export interface ModelSelectorProps {
    model: string;
    setModel: (model: string) => void;
    availableModels: OllamaModel[];
    fetchingModels: boolean;
    fetchModels: () => void; 
    disabled: boolean;
}
export interface ConnectionStatusDisplayProps {
    loading: boolean; 
    connectionStatus: boolean | null;
    error: string | null; 
    modelCount: number;
}
export interface GenerationPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    loading: boolean; 
    disabled: boolean; 
}
export interface ResponsePreviewProps {
    loading: boolean; 
    generationResponse: string | null; 
    error: string | null; 
}