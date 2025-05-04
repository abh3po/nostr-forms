import axios from 'axios';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
  digest: string;
}

export interface GenerationRequest {
  prompt: string;
  formType?: string;
  temperature?: number;
}

export interface GenerationResponse {
  success: boolean;
  fields?: Array<any>;
  error?: string;
  rawResponse?: string;
  formName?: string;
  description?: string;
}

export const defaultOllamaConfig: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3'
};

class OllamaService {
  private config: OllamaConfig = defaultOllamaConfig;
  private availableModels: OllamaModel[] = [];

  setConfig(config: Partial<OllamaConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): OllamaConfig {
    return this.config;
  }

  getAvailableModels(): OllamaModel[] {
    return this.availableModels;
  }

    async fetchAvailableModels(): Promise<OllamaModel[]> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`);
      if (response.data && response.data.models) {
        this.availableModels = response.data.models;
  
        // If current model isn't in the list, set to first available one
        if (this.availableModels.length > 0) {
          const modelNames = this.availableModels.map(model => model.name);
          if (!modelNames.includes(this.config.model)) {
            this.config.model = this.availableModels[0].name;
          }
        }
  
        return this.availableModels;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch Ollama models:", error);
      if (error instanceof Error && error.message.includes('Network Error')) {
        console.log("Network error - this might be a CORS issue if using a remote server");
      }
      this.availableModels = [];
      return [];
    }
  }

  async generateForm(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const systemPrompt = `You are a form creation assistant specialized in creating web forms.
      
      Create a JSON structure for a ${request.formType || "general"} form with the following format:
      
      {
        "fields": [
          {
            "id": "unique_string_id",
            "type": "FIELD_TYPE",
            "label": "Question text",
            "required": boolean,
            "description": "Optional help text for the field",
            "placeholder": "Optional placeholder text",
            "options": ["Option 1", "Option 2", "Option 3"] // Only for multiple-choice, single-choice, or dropdown fields
          },
          // More fields...
        ],
        "formName": "Form name based on the prompt",
        "description": "A comprehensive description for the form"
      }
      
      SUPPORTED FIELD TYPES (use these exact strings):
      - "short_text" - For short text responses
      - "paragraph" - For longer text responses
      - "number" - For numerical input
      - "multiple_choice" - For checkbox selection (multiple answers)
      - "single_choice" - For radio button selection (one answer)
      - "dropdown" - For dropdown selection
      - "date" - For date selection
      - "time" - For time selection
      
      IMPORTANT RULES:
      1. For required fields, provide sensible default or example answers
      2. Always include a form description that summarizes the purpose of the form
      3. For multiple_choice, single_choice, and dropdown fields, always provide an "options" array with at least 2-5 choices
      4. Each field must have a unique ID
      5. Return ONLY valid JSON
      `;

      const response = await axios.post(`${this.config.baseUrl}/api/generate`, {
        model: this.config.model,
        prompt: request.prompt,
        system: systemPrompt,
        stream: false,
        temperature: request.temperature || 0.7,
        format: "json"
      });

      // Add this to the generateForm method right after the axios.post call
      if (response.data) {
        try {
          // Parse the model's output to extract JSON
          const jsonMatch = response.data.response.match(/```json\s*([\s\S]*?)\s*```/) ||
            response.data.response.match(/({[\s\S]*})/) ||
            [null, response.data.response];

          const jsonContent = jsonMatch[1];
          const parsedResponse = JSON.parse(jsonContent);

          // Create a standardized response object
          const result = {
            success: true,
            fields: parsedResponse.fields || [],
            formName: parsedResponse.formName || undefined,
            description: parsedResponse.description || undefined,
            rawResponse: response.data.response
          };

          // Ensure every field has proper options array
          if (result.fields) {
            result.fields = result.fields.map((field: any, index: number) => {
              // Ensure field has an ID
              if (!field.id) field.id = `field_${index}`;

              // For choice fields, ensure options are properly formatted
              if ((field.type === 'multiple_choice' || field.type === 'single_choice' || field.type === 'dropdown') &&
                (!field.options || !Array.isArray(field.options))) {
                field.options = ['Option 1', 'Option 2', 'Option 3'];
              }

              return field;
            });
          }

          return result;
        } catch (parseError) {
          console.error("Failed to parse Ollama response", parseError);
          return {
            success: false,
            error: "Failed to parse AI response",
            rawResponse: response.data.response
          };
        }
      }

      return { success: false, error: "No response from Ollama" };
    } catch (error) {
      console.error("Ollama API error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error connecting to Ollama"
      };
    }
  }

  async testConnection(): Promise<{ success: boolean, error?: string }> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/version`);
      if (response.data) {
        // After successful connection, fetch available models
        await this.fetchAvailableModels();
        return { success: true };
      }
      return { success: false, error: "No data received from server" };
    } catch (error) {
      console.error("Ollama connection test failed:", error);
      let errorMessage = "Unknown connection error";

      if (error instanceof Error) {
        if (error.message.includes('Network Error')) {
          errorMessage = "Network error - verify the server address and ensure CORS is enabled if using a remote server";
        } else {
          errorMessage = error.message;
        }
      }

      return { success: false, error: errorMessage };
    }
  }
}

export const ollamaService = new OllamaService();
export default ollamaService;