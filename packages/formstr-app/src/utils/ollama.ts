/// <reference lib="es2015.promise" />
import { getItem, LOCAL_STORAGE_KEYS } from "./localStorage";

interface OllamaGenerateResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
}

function getOllamaApiUrl(): string {
    const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_URL, { parseAsJson: false });
    return storedUrl?.trim() || 'http://localhost:11434';
}

function getOllamaModelName(): string {
    const storedModel = getItem<string>(LOCAL_STORAGE_KEYS.OLLAMA_MODEL, { parseAsJson: false });
    return storedModel?.trim() || 'llama3';
}

export function generateWithOllama(
    prompt: string,
    model: string = getOllamaModelName()
): Promise<string> {
    const apiUrl = getOllamaApiUrl();
    const endpoint = `${apiUrl}/api/generate`;
    console.log(`Sending prompt to Ollama (Using model: ${model} @ ${endpoint}): "${prompt.substring(0, 100)}..."`);

    return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model, prompt: prompt, stream: false }),
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
        return data.response.trim();
    }).catch(error => {
        console.error("Error communicating with Ollama:", error);

        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error(
                `Failed to fetch from the LLM Server URL (${apiUrl}). ` +
                `Please ensure the URL is correct, the server is running, and reachable. ` +
                `)`
            );
        }
        throw error;
    });
}

export function generateJsonWithOllama<T = any>(
    prompt: string,
    model: string = getOllamaModelName()
): Promise<T> {
    const jsonStringPromise = generateWithOllama(prompt, model);

    return jsonStringPromise.then(jsonString => {
        try {
            const parsedJson = JSON.parse(jsonString);
            return parsedJson as T;
        } catch (parseError) {
            console.error("Failed to parse JSON response from Ollama:", parseError);
            console.error("Received string that failed parsing:", jsonString);
            throw new Error(`Failed to parse JSON response from Ollama. Raw response: ${jsonString}`);
        }
    });
}