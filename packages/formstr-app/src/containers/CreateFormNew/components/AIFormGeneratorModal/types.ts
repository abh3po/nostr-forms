import { OllamaModel } from '../../../../services/ollamaService';
import { ProcessedFormData } from '../../../../utils/aiProcessor';

export interface AIFormGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFormGenerated: (processedData: ProcessedFormData) => void;
}
export interface OllamaSettingsProps {
}
export interface ModelSelectorProps {
    model: string;
    setModel: (model: string) => void;
    availableModels: OllamaModel[];
    fetchingModels: boolean;
    disabled: boolean;
}
export interface GenerationPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    loading: boolean;
    disabled: boolean;
}