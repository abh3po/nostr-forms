export const CREATE_FORM_TOOL_SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The main title of the form.',
    },
    description: {
      type: 'string',
      description: 'Optional: A brief description or introduction for the form.',
    },
    fields: {
      type: 'array',
      description: 'An array of objects, where each object represents a field/question in the form.',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'MANDATORY: The type of the form field. Must be one of the specified enum values.',
            enum: [ 
              'ShortText',
              'LongText',
              'Email',
              'Number',
              'MultipleChoice',
              'SingleChoice',
              'Checkbox',
              'Dropdown',
              'Date',
              'Time',
             ],
          },
          label: {
            type: 'string',
            description: 'The text label or question for the form field.',
          },
          required: {
            type: 'boolean',
            description: 'Optional: Set to true if the field must be filled out by the user. Defaults to false if unsure.',
          },
          options: {
            type: 'array',
            description: 'REQUIRED for MultipleChoice, SingleChoice, Checkbox, or Dropdown types. An array of strings representing the choices.',
            items: {
              type: 'string',
            },
          },
        },
        required: ['type', 'label'],
      },
    },
  },
  required: ['title', 'fields'],
};

const allowedTypesString = CREATE_FORM_TOOL_SCHEMA.properties.fields.items.properties.type.enum.join("', '");
export const CREATE_FORM_SYSTEM_PROMPT = `You are an expert JSON generator using the 'create_form_structure' tool to create web forms. Respond ONLY with the JSON output required by the tool call.

CRITICAL RULES:
1.  **Structure:** Output MUST include 'title' (string) and 'fields' (array of field objects). 'description' (string) is optional. The 'fields' array MUST be flat.
2.  **Field 'type':** EVERY field object MUST have a 'type' property. Its value MUST be EXACTLY one of: '${allowedTypesString}'.
3.  **Type Selection:** Choose the MOST SPECIFIC type from the allowed list based on the field's purpose.
    -   'Email': Use for email addresses.
    -   'Date'/'Time': Use for dates/times.
    -   'Number': Use for numerical input.
    -   'LongText': Use for paragraphs or multi-line input.
    -   'ShortText': Use for other single-line text.
4.  **Choice Fields ('MultipleChoice', 'SingleChoice', 'Checkbox', 'Dropdown'):**
    -   These types REQUIRE an 'options' property: an array of at least two strings.
    -   Use 'Checkbox' ONLY if MULTIPLE selections are allowed.
    -   Use 'SingleChoice' or 'MultipleChoice' if ONLY ONE selection is allowed (radio button style).
    -   Use 'Dropdown' if ONLY ONE selection is allowed (dropdown list style).
5.  **Required Fields:** Include 'required: true' only if explicitly requested or clearly implied for a field.

Analyze the user prompt carefully and generate the complete, valid JSON structure adhering strictly to these rules and the tool's schema.`;