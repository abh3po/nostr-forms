import { OllamaModel } from '../../../../services/ollamaService';
import { ProcessedFormData } from './aiProcessor';

export interface AIFormGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFormGenerated: (processedData: ProcessedFormData) => void;
}

export interface GenerationPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    loading: boolean;
    disabled: boolean;
}