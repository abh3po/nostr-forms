import React, { useState } from 'react';
// Import the Ollama utility function
import { generateJsonWithOllama } from '../../../../utils/ollama'; // Adjust path relative to this file

// Define the expected data structure for the generated form
export interface FormFieldData {
    id: string; // Placeholder - might need unique generation later
    type: string; // e.g., 'ShortText', 'MultipleChoice'
    label: string;
    required?: boolean;
    options?: string[];
}

export interface GeneratedFormData {
    title: string;
    description?: string;
    fields: FormFieldData[];
}

// Define the props for the component
interface LLMFormGeneratorProps {
    onFormGenerated: (formData: GeneratedFormData) => void; // Callback function to parent
    // Add any other props needed, e.g., initial description, styles
}

// --- Helper function for basic validation ---
// Checks if the data structure roughly matches what we expect from the LLM
function isValidGeneratedFormData(data: any): data is GeneratedFormData {
    if (!data || typeof data !== 'object') {
        console.error("Validation Error: Response is not an object.", data);
        return false;
    }
    if (typeof data.title !== 'string' || data.title.trim() === '') {
        console.error("Validation Error: Missing or empty 'title'.", data);
        return false;
    }
    if (data.description && typeof data.description !== 'string') {
        console.error("Validation Error: 'description' exists but is not a string.", data);
        return false;
    }
    if (!Array.isArray(data.fields)) {
        console.error("Validation Error: 'fields' is not an array.", data);
        return false;
    }
    // Optional: Add more granular validation for each field if needed
    for (const field of data.fields) {
        if (!field || typeof field !== 'object' || typeof field.label !== 'string' || typeof field.type !== 'string') {
            console.error("Validation Error: A field is missing required properties (label, type).", field);
            // return false; // Decide how strict to be - maybe allow partially valid forms?
        }
        // Check options validity if needed
        if ((field.type === 'MultipleChoice' || field.type === 'Checkbox' || field.type === 'Dropdown') && !Array.isArray(field.options)) {
             console.warn("Validation Warning: Choice field is missing 'options' array.", field);
             // Don't return false here, maybe just generate an empty options array later?
        }
    }
    return true; // Passed basic checks
}


// --- The UI Component ---
export const LLMFormGenerator: React.FC<LLMFormGeneratorProps> = ({ onFormGenerated }) => {
    const [description, setDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    // Handles the click event for the generate button
    const handleGenerateClick = () => {
        // Basic check before sending API request
        if (description.trim() === '') {
             setError("Please enter a description for the form.");
             return;
        }

        setError(null); // Clear previous errors
        setIsLoading(true); // Set loading state

        // --- Construct the Prompt for the LLM ---
        const prompt = `
You are an assistant that generates JSON structures for web forms based on user descriptions.
Analyze the following user description and create a JSON object representing the form.

The JSON object MUST have the following structure:
{
  "title": "string", // The main title of the form
  "description": "string", // Optional: A brief description of the form
  "fields": [ // An array of field objects
    {
      "id": "string", // A unique identifier string (e.g., "field_name", "question_1") - generate based on label if possible
      "type": "string", // The type of the form field. Supported types: ShortText, LongText, Email, Number, MultipleChoice, Checkbox, Dropdown, Date, Time
      "label": "string", // The text label/question for the field
      "required": boolean, // Optional: true if the field must be filled, defaults to false
      "options": ["string", "string", ...] // Optional: An array of strings for MultipleChoice, Checkbox, Dropdown types ONLY
    }
    // ... more field objects
  ]
}

IMPORTANT RULES:
- Respond ONLY with the valid JSON object described above.
- Do NOT include any introductory text, explanations, apologies, or markdown formatting like \`\`\`json before or after the JSON object.
- Ensure all field types are one of the supported types listed. If a type seems unsupported, use 'ShortText' or 'LongText'.
- Infer field types and requirement status from the description where possible. If requirement is unclear, default 'required' to false.
- Provide sensible, unique 'id' strings for each field (e.g., based on the label, lowercased with underscores).
- If the description asks for choice options, include the 'options' array for that field.

User Description:
"${description}"

JSON Output:
`;

        // --- Call the Ollama API Utility ---
        generateJsonWithOllama<GeneratedFormData>(prompt) // Expecting GeneratedFormData structure
            .then(parsedData => {
                 // --- Validate the Response ---
                 console.log("Raw data received from Ollama parser:", parsedData);
                 if (isValidGeneratedFormData(parsedData)) {
                     console.log("Validation successful. Calling onFormGenerated.");
                     // --- Pass Valid Data to Parent ---
                     // Note: ID uniqueness and generation might need refinement in Step 5
                     onFormGenerated(parsedData);
                 } else {
                     // Throw an error if validation function returns false
                     throw new Error("Received invalid or incomplete form structure from AI. Please try rephrasing your description or check the Ollama model.");
                 }
                 setIsLoading(false); // Stop loading on success
            })
            .catch(err => {
                 // --- Handle Errors ---
                 console.error("Error during AI form generation:", err);
                 if (err instanceof Error) {
                     setError(err.message); // Display specific error message
                 } else {
                     setError("An unknown error occurred during form generation."); // Fallback message
                 }
                 setIsLoading(false); // Stop loading on error
            });
            // NOTE: No .finally() block here
    };

    // --- Basic Styling --- (Adapt to your project's styling solution)
    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            padding: '15px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            margin: '10px 0',
            backgroundColor: '#f9f9f9',
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold',
        },
        textarea: {
            width: '95%', // Adjust as needed
            minHeight: '80px',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box', // Include padding and border in the element's total width and height
        },
        button: {
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff', // Example blue color
            color: 'white',
            cursor: 'pointer',
            opacity: isLoading ? 0.6 : 1,
            transition: 'opacity 0.2s ease-in-out',
        },
        buttonDisabled: { // Style for when button is explicitly disabled
             backgroundColor: '#cccccc',
             cursor: 'not-allowed',
        },
        loading: {
            marginTop: '10px',
            fontStyle: 'italic',
            color: '#555',
        },
        error: {
            marginTop: '10px',
            color: '#dc3545', // Example red color
            fontWeight: 'bold',
            padding: '8px',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
        },
    };

    // --- Render JSX ---
    return (
        <div style={styles.container}>
            <label htmlFor="form-description-ai" style={styles.label}>
                Describe the form you want to create:
            </label>
            <textarea
                id="form-description-ai"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="e.g., A simple contact form with name, email, and message fields. Make email required."
                rows={4}
                style={styles.textarea}
                disabled={isLoading} // Disable textarea while loading
            />
            <button
                onClick={handleGenerateClick}
                // Disable if loading OR if description is empty after trimming whitespace
                disabled={isLoading || description.trim() === ''}
                style={{
                    ...styles.button,
                    ...(isLoading || description.trim() === '' ? styles.buttonDisabled : {}) // Apply disabled style
                }}
            >
                {isLoading ? 'Generating...' : 'Generate Form with AI'}
            </button>

            {/* Conditional rendering for loading indicator */}
            {isLoading && (
                <div style={styles.loading}>Communicating with AI assistant... Please wait.</div>
            )}

            {/* Conditional rendering for error message */}
            {error && (
                <div style={styles.error}>Error: {error}</div>
            )}
        </div>
    );
};

// Optional: Default export if this is the primary component in the index.tsx file
// export default LLMFormGenerator;