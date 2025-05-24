import { Ollama } from 'ollama/browser';
import type { ChatRequest, ChatResponse, ModelResponse } from 'ollama';
import { getItem, setItem, LOCAL_STORAGE_KEYS } from '../utils/localStorage';

export interface OllamaConfig {
    baseUrl: string;
    modelName: string;
}
export interface OllamaModel {
    name: string;
    modified_at: Date;
    size: number;
    digest: string;
    details: {
        parent_model: string;
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
}
export interface GenerateFormParams {
    prompt: string;
    systemPrompt?: string;
    tools?: any[]; 
}
export interface GenerateFormResult {
    success: boolean;
    data?: any; 
    error?: string;
    rawResponse?: string; 
}
export interface TestConnectionResult {
    success: boolean;
    error?: string;
}
export interface FetchModelsResult {
    success: boolean;
    models?: OllamaModel[];
    error?: string;
}
const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_MODEL_NAME = 'llama3'; 

class OllamaService {
    private config: OllamaConfig;
    private ollamaInstance: Ollama;
    constructor() {
        const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_URL, { parseAsJson: false });
        const storedModel = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, { parseAsJson: false });
        this.config = {
            baseUrl: storedUrl || DEFAULT_OLLAMA_URL,
            modelName: storedModel || DEFAULT_MODEL_NAME,
        };
        this.ollamaInstance = new Ollama({ host: this.config.baseUrl });
        console.log('OllamaService initialized with config:', this.config);
    }

    getConfig(): OllamaConfig {
        return { ...this.config };
    }

    setConfig(newConfig: Partial<OllamaConfig>) {
        const updatedConfig = { ...this.config, ...newConfig };
        let configChanged = false;
        if (newConfig.baseUrl && newConfig.baseUrl !== this.config.baseUrl) {
            this.config.baseUrl = newConfig.baseUrl;
            setItem(LOCAL_STORAGE_KEYS.OLLAMA_URL, this.config.baseUrl, { parseAsJson: false }); 
            this.ollamaInstance = new Ollama({ host: this.config.baseUrl });
            configChanged = true;
            console.log('OllamaService baseUrl updated:', this.config.baseUrl);
        }
        if (newConfig.modelName && newConfig.modelName !== this.config.modelName) {
            this.config.modelName = newConfig.modelName;
            setItem(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, this.config.modelName, { parseAsJson: false });
            configChanged = true;
            console.log('OllamaService modelName updated:', this.config.modelName);
        }
        if(configChanged){
             console.log('OllamaService config changed:', this.config);
        }
    }
    async testConnection(): Promise<TestConnectionResult> {
        console.log(`Testing connection to Ollama at ${this.config.baseUrl}...`);
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`, { method: 'GET' });
            if (response.ok) {
                 console.log('Ollama connection test successful.');
                return { success: true };
            } else {
                 console.warn(`Ollama connection test failed: Status ${response.status}`);
                return { success: false, error: `Server responded with status ${response.status}` };
            }
        } catch (error: any) {
            console.error('Ollama connection test error:', error);
            let errorMessage = 'Failed to connect to Ollama server.';
            if (error.message?.includes('Failed to fetch')) {
                errorMessage += ` Is the server running at ${this.config.baseUrl} and CORS configured correctly?`;
            } else if (error.message) {
                 errorMessage += ` (${error.message})`
            }
            return { success: false, error: errorMessage };
        }
    }
    async fetchModels(): Promise<FetchModelsResult> {
        console.log(`Fetching models from ${this.config.baseUrl}...`);
        try {
            const response = await this.ollamaInstance.list();
            const models: OllamaModel[] = response.models || [];
            console.log(`Fetched ${models.length} models.`);
             if (models.length > 0 && !models.some(m => m.name === this.config.modelName)) {
                console.log(`Current model '${this.config.modelName}' not found. Setting to default: '${models[0].name}'`);
                this.setConfig({ modelName: models[0].name });
             } else if (models.length === 0) {
                 console.warn("No models found on the server.");
             }
            return { success: true, models };
        } catch (error: any) {
            console.error('Failed to fetch Ollama models:', error);
             let errorMessage = 'Failed to fetch models.';
             if (error.message?.includes('fetch')) {
                 errorMessage += ` Could not reach ${this.config.baseUrl}.`;
             } else if (error.message) {
                 errorMessage += ` (${error.message})`;
             }
            return { success: false, error: errorMessage };
        }
    }
    async generateForm(params: GenerateFormParams): Promise<GenerateFormResult> {
        console.log(`Generating form with model: ${this.config.modelName} @ ${this.config.baseUrl}`);
        const chatRequest: ChatRequest = {
            model: this.config.modelName,
            messages: [
                ...(params.systemPrompt ? [{ role: 'system' as const, content: params.systemPrompt }] : []),
                { role: 'user' as const, content: params.prompt }
            ],
            tools: params.tools,
            stream: false as const
        };
        try {
            const response = await this.ollamaInstance.chat({
                ...chatRequest,
                stream: false
            } as ChatRequest & { stream: false });
            console.log("Raw response from Ollama library:", response);
            const toolCalls = response.message?.tool_calls;
            if (!toolCalls || toolCalls.length === 0) {
                console.warn("Ollama response did not contain tool calls.", response.message?.content);
                return {
                    success: false,
                    error: "AI response received, but no function call was made. Try rephrasing your request.",
                    rawResponse: response.message?.content
                };
            }
            const formToolCall = toolCalls[0];
            if (formToolCall.function?.name !== 'create_form_structure') {
                 console.warn("Expected tool 'create_form_structure' not found:", formToolCall.function?.name);
                 return {
                      success: false,
                      error: `AI used an unexpected tool: '${formToolCall.function?.name}'. Expected 'create_form_structure'.`,
                      rawResponse: response.message?.content
                 };
            }
            try {
                let parsedArgs = formToolCall.function.arguments;
                if (typeof parsedArgs === 'string') {
                    try {
                         parsedArgs = JSON.parse(parsedArgs);
                    } catch (jsonParseError: any) {
                         console.error("Failed to parse arguments string:", jsonParseError, "String was:", parsedArgs);
                         return { success: false, error: `Failed to parse AI arguments: ${jsonParseError.message}` };
                    }
                }
                if (parsedArgs && typeof parsedArgs.fields === 'string') {
                    try {
                        parsedArgs.fields = JSON.parse(parsedArgs.fields);
                    } catch (fieldParseError: any) {
                        console.error("Failed to parse 'fields' string within arguments:", fieldParseError, "Fields string was:", parsedArgs.fields);
                        return { success: false, error: "AI provided 'fields' as a malformed JSON string." };
                    }
                }
                 if (!parsedArgs || typeof parsedArgs !== 'object' || typeof parsedArgs.title !== 'string' || !Array.isArray(parsedArgs.fields)) {
                    console.error("Parsed arguments missing required structure:", parsedArgs);
                    return { success: false, error: "AI tool arguments missing required 'title' or 'fields' structure." };
                }
                console.log("Successfully parsed tool arguments:", parsedArgs);
                return { success: true, data: parsedArgs };
            } catch (parseError: any) {
                console.error("Error processing tool call arguments:", parseError, "Raw args:", formToolCall.function.arguments);
                return { success: false, error: `Failed to process AI tool arguments: ${parseError.message}` };
            }
        } catch (error: any) {
            console.error("Error during Ollama chat call:", error);
            let userMessage = "An unknown error occurred while communicating with the AI.";
            if (error.message?.includes('fetch') || error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')) {
                userMessage = `Network Error: Could not connect to Ollama server at ${this.config.baseUrl}. Is it running and CORS configured?`;
            } else if (error.message?.includes('404') && error.message?.includes('model not found')) {
                 userMessage = `Error: Model '${this.config.modelName}' not found on the Ollama server.`;
            } else if (error.message) {
                 userMessage = error.message;
            }
            return { success: false, error: userMessage };
        }
    }
}
export const ollamaService = new OllamaService();