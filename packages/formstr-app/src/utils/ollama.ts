import { Ollama } from 'ollama/browser'; 
import { CREATE_FORM_TOOL_SCHEMA } from '../constants/prompts';
import { GeneratedFormData } from '../containers/CreateFormNew/components/LLMFormGenerator';
import type { ChatRequest, ChatResponse } from 'ollama';
/**
 * @param prompt
 * @param ollamaUrl
 * @param modelName
 * @returns
 */
export async function generateFormWithOllamaTool(
    prompt: string,
    ollamaUrl: string,
    modelName: string
): Promise<GeneratedFormData | null> {
    console.log(`Using Ollama library (model: ${modelName} @ ${ollamaUrl})`);
    const ollama = new Ollama({ host: ollamaUrl });
    const allowedTypesString = CREATE_FORM_TOOL_SCHEMA.properties.fields.items.properties.type.enum.join("', '");
    const systemPrompt = `You are an assistant that generates web form JSON structures using the 'create_form_structure' tool. Analyze the user's request for form fields. CRITICAL REQUIREMENT: For EVERY field object in the 'fields' array, you MUST include the 'type' property. The value for 'type' MUST be one of the following exact strings: '${allowedTypesString}'. DO NOT omit 'type'. DO NOT use values outside this list. Choose the *most specific* type possible based on the field's purpose.

Examples:
- Use 'ShortText' for single-line text inputs like names, subjects, cities.
- Use 'LongText' for multi-line text inputs like comments, feedback, descriptions, addresses.
- Use 'Number' for numerical input like age, quantity, ratings.
- Use 'Date' for calendar date selection.
- Use 'Time' for time selection.
- Use 'Email' for email address input (use this specific type).
- If choices/options are required:
    - Use 'Checkbox' if the user can select MULTIPLE options.
    - Use 'MultipleChoice' for selecting only ONE option using radio buttons.
    - Use 'Dropdown' for selecting only ONE option from a dropdown list (good for many options).

Do NOT use the generic 'text' or 'choice' types if a more specific type from the list applies.`;
  
    const chatRequest = {
        model: modelName,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        tools: [
            {
                type: 'function' as const, 
                function: {
                    name: 'create_form_structure',
                    description: 'Generates the JSON structure for a web form based on a description. Captures title, optional description, and an array of fields including their type, label, requirement status, and options (for choice types).',
                    parameters: CREATE_FORM_TOOL_SCHEMA,
                },
            }
        ],
        stream: false as const, 
    };
    try {
        const response: ChatResponse = await ollama.chat(chatRequest);
        // console.log("Raw response from Ollama library:", response);
        const toolCalls = response.message?.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
            console.warn("Ollama library response did not contain tool calls.", response.message?.content);
            throw new Error("AI response received via library, but no tool call was made. Try rephrasing.");
        }
        const formToolCall = toolCalls.find(
            (call) => call.function?.name === 'create_form_structure'
        );
        if (!formToolCall) {
            console.warn("Correct tool 'create_form_structure' not found in tool_calls:", toolCalls);
            throw new Error("AI used a tool, but not the expected 'create_form_structure' tool.");
        }
        try {
            let parsedArgs = formToolCall.function.arguments;
            if (typeof parsedArgs === 'string') {
                // console.log("Arguments received as string, parsing JSON...");
                parsedArgs = JSON.parse(parsedArgs);
            } else {
                // console.log("Arguments received as object.");
            }
            if (parsedArgs && typeof parsedArgs.fields === 'string') {
                // console.log("Fields property is a string, attempting to parse it...");
                try {
                    parsedArgs.fields = JSON.parse(parsedArgs.fields);
                } catch (fieldParseError) {
                     console.error("Failed to parse the 'fields' string within arguments:", fieldParseError, "Fields string was:", parsedArgs.fields);
                     throw new Error("AI provided 'fields' as a malformed JSON string.");
                }
            }
            if (!parsedArgs || typeof parsedArgs !== 'object' || typeof parsedArgs.title !== 'string' || !Array.isArray(parsedArgs.fields)) {
                 console.error("Parsed arguments missing required structure:", parsedArgs);
                 throw new Error("AI tool arguments missing required 'title' or 'fields' structure.");
            }
            console.log("Successfully extracted/validated tool arguments via library:", parsedArgs);
            return parsedArgs as GeneratedFormData;
        } catch (parseError) {
            console.error("Failed to parse tool call arguments JSON via library:", parseError, "Arguments received were:", formToolCall.function.arguments);
            const errorMsg = parseError instanceof Error ? parseError.message : "Failed to process AI tool arguments.";
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error("Error during Ollama library call or processing:", error);
        let userMessage = "An unknown error occurred while generating the form.";
        if (error instanceof Error) {
             if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('ECONNREFUSED')) {
                 userMessage = `Network Error: Could not connect to Ollama server at ${ollamaUrl}. Is it running?`;
             } else if (error.message.includes('404') && error.message.includes('model not found')) {
                  userMessage = `Error: Model '${modelName}' not found on the Ollama server.`;
             } else {
                  userMessage = error.message;
             }
        }
         throw new Error(userMessage);
    }
}