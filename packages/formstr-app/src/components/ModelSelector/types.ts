import { OllamaModel } from "../../services/ollamaService";

export interface ModelSelectorProps {
    model: string | undefined;
    setModel: (model: string) => void;
    availableModels: OllamaModel[];
    fetching: boolean;
    disabled: boolean;
    style?: React.CSSProperties;
    placeholder?: string;
}