/// <reference lib="es2015.promise" />

// --- Configuration ---
// You might want to move this to a config file or environment variables later
const OLLAMA_API_BASE_URL = 'http://localhost:11434'; // Default Ollama API URL
const OLLAMA_DEFAULT_MODEL = 'helper'; // Default model to use if not specified

// --- Interfaces ---
// Defines the expected structure of a *non-streaming* response from Ollama's /api/generate
interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string; // This is the main generated text content
    done: boolean;
    context?: number[]; // Context for follow-up requests (optional)
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

// --- Utility Function ---

/**
 * Sends a prompt to a local Ollama instance and returns the generated response.
 * Uses the non-streaming /api/generate endpoint.
 *
 * @param prompt - The text prompt to send to the LLM.
 * @param model - (Optional) The specific Ollama model to use (e.g., 'llama3', 'mistral'). Defaults to OLLAMA_DEFAULT_MODEL.
 * @param apiUrl - (Optional) The base URL for the Ollama API. Defaults to OLLAMA_API_BASE_URL.
 * @returns A Promise that resolves with the generated text string.
 * @throws An error if the API request fails or the response cannot be parsed.
 */
export function generateWithOllama(
    prompt: string,
    model: string = OLLAMA_DEFAULT_MODEL,
    apiUrl: string = OLLAMA_API_BASE_URL
): Promise<string> {
    const endpoint = `${apiUrl}/api/generate`;
    console.log(`Sending prompt to Ollama (${model} @ ${endpoint}): "${prompt.substring(0, 100)}..."`); // Log start (truncated prompt)

    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            stream: false, // Important: We want the full response at once
        }),
    }).then(response => {
        if (!response.ok) {
            return response.text().then(errorBody => {
                throw new Error(`Ollama API request failed: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            });
        }
        return response.json();
    }).then((data: OllamaGenerateResponse) => {
        if (typeof data.response !== 'string') {
            throw new Error('Ollama API response is missing the "response" field or it is not a string.');
        }
        console.log(`Received response from Ollama (${model}): "${data.response.substring(0, 100)}..."`); // Log success (truncated response)
        return data.response.trim(); // Return the generated text, trimmed of whitespace
    }).catch(error => {
        console.error("Error communicating with Ollama:", error);
        throw error;
    });
}

// --- Optional: Add a function specifically for generating JSON ---
// This adds slightly more robust parsing for expected JSON output

/**
 * Sends a prompt to Ollama, expecting a JSON string in response, and attempts to parse it.
 *
 * @param prompt - The prompt, specifically instructing the LLM to return JSON.
 * @param model - (Optional) The Ollama model.
 * @param apiUrl - (Optional) The Ollama API base URL.
 * @returns A Promise resolving to the parsed JavaScript object/array.
 * @throws An error if the API fails, the response isn't valid JSON, or the response field is missing.
 */
export function generateJsonWithOllama<T = any>(
    prompt: string,
    model: string = OLLAMA_DEFAULT_MODEL,
    apiUrl: string = OLLAMA_API_BASE_URL
): Promise<T> {
    const jsonStringPromise = generateWithOllama(prompt, model, apiUrl);

    return jsonStringPromise.then(jsonString => {
        try {
            const parsedJson = JSON.parse(jsonString);
            console.log(`Successfully parsed JSON from Ollama.`);
            return parsedJson as T;
        } catch (parseError) {
            console.error("Failed to parse JSON response from Ollama:", parseError);
            console.error("Received string that failed parsing:", jsonString); // Log the raw string
            throw new Error(`Failed to parse JSON response from Ollama. Raw response: ${jsonString}`);
        }
    });
}