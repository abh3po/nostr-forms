
export const OLLAMA_FORM_GENERATION_PROMPT_TEMPLATE = `
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
`;

