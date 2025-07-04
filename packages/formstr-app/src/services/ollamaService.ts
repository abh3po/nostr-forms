import { getItem, setItem, LOCAL_STORAGE_KEYS } from '../utils/localStorage';

export interface OllamaConfig { baseUrl: string; modelName: string; }
export interface OllamaModel { name: string; modified_at: Date; size: number; digest: string; details: { parent_model: string; format: string; family: string; families: string[] | null; parameter_size: string; quantization_level: string; }; }
export interface GenerateParams { prompt: string; system?: string; format?: 'json'; modelName?: string; stream?: boolean; }
export interface GenerateResult { success: boolean; data?: any; error?: string; }
export interface TestConnectionResult { success: boolean; error?: string; }
export interface FetchModelsResult { success: boolean; models?: OllamaModel[]; error?: string; }

// The window.ollama API provided by the companion extension
declare global {
    interface Window {
        ollama?: {
            request: (endpoint: string, options: RequestInit) => Promise<any>;
            getModels: () => Promise<any>;
            generate: (params: any, onData?: (chunk: any) => void) => Promise<any>;
            testConnection: () => Promise<any>;
        };
    }
}

class OllamaService {
    private config: OllamaConfig;

    constructor() {
        this.config = this.getConfig();
    }

    getConfig(): OllamaConfig {
        const savedConfig = getItem<OllamaConfig>(LOCAL_STORAGE_KEYS.OLLAMA_CONFIG);
        return savedConfig || { baseUrl: 'http://localhost:11434', modelName: '' };
    }

    setConfig(newConfig: Partial<OllamaConfig>) {
        this.config = { ...this.config, ...newConfig };
        setItem(LOCAL_STORAGE_KEYS.OLLAMA_CONFIG, this.config);
    }

    private isAvailable(): boolean {
        return typeof window.ollama !== 'undefined';
    }

    async testConnection(): Promise<TestConnectionResult> {
        if (!this.isAvailable()) {
            return { success: false, error: 'EXTENSION_NOT_FOUND' };
        }
        return window.ollama!.testConnection();
    }

    async fetchModels(): Promise<FetchModelsResult> {
       if (!this.isAvailable()) {
            return { success: false, error: 'EXTENSION_NOT_FOUND' };
       }
       const response = await window.ollama!.getModels();
       return {
            success: response.success,
            models: response.data?.models,
            error: response.error,
       };
    }

    async generate(params: GenerateParams, onData?: (chunk: any) => void): Promise<GenerateResult> {
        if (!this.isAvailable()) {
            return { success: false, error: 'EXTENSION_NOT_FOUND' };
        }
        const body = {
            model: params.modelName || this.config.modelName,
            prompt: params.prompt,
            system: params.system,
            format: params.format,
            stream: !!onData,
        };

        try {
            const finalResponse = await window.ollama!.generate(body, onData);
            return finalResponse;
        } catch (e: any) {
            return { success: false, error: e.message || "An unknown error occurred." };
        }
    }
}

export const ollamaService = new OllamaService();