import { Field } from '../nostr/types';

import { FormTemplate } from './types';

let fieldCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;

const emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

export const contactInfoTemplate: FormTemplate = {
  id: 'contactInfo',
  name: 'Contact Info',
  description: 'Gather contact details.',
  initialState: {
    formName: 'Contact Information',
    formSettings: {
      description: 'Contact details.',
      thankYouPage: true,
      notifyNpubs: [],
      publicForm: true,
      disallowAnonymous: false,
      encryptForm: true,
      viewKeyInUrl: true,
    },
    questionsList: [
      // Field 1: Name (Required, Short Text)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Name', // label
        '[]', // options
        '{"renderElement": "shortText", "required": true}', // config
      ] as Field,

      // Field 2: Email (Required, Short Text, with validation)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Email', // label
        '[]', // options
        JSON.stringify({
          // Stringify the config object
          renderElement: 'shortText',
          required: true,
          validationRules: {
            regex: {
              pattern: emailRegex,
              errorMessage: 'Please enter a valid email address.',
            },
          },
        }), // config
      ] as Field,

      // Field 3: Address (Required, Paragraph)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Address', // label
        '[]', // options
        '{"renderElement": "paragraph", "required": true}', // config (Assuming 'paragraph' exists)
      ] as Field,

      // Field 4: Phone number (Not Required, Short Text)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Phone number', // label
        '[]', // options
        '{"renderElement": "shortText", "required": false}', // config
      ] as Field,

      // Field 5: Comments (Not Required, Paragraph)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Comments', // label
        '[]', // options
        '{"renderElement": "paragraph", "required": false}', // config (Assuming 'paragraph' exists)
      ] as Field,
    ],
  },
};

fieldCounter = 0;
