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
              'Checkbox',
              'Dropdown',
              'Date',
              'Time',
              'text',
              'choice'
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
            description: 'Optional: An array of strings representing the choices for MultipleChoice, Checkbox, or Dropdown types. Should only be included for these types.',
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