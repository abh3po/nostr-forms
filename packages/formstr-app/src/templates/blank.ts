import { FormTemplate } from './types';
import { Field } from '../nostr/types'; 

let fieldCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;

export const blankTemplate: FormTemplate = {
  id: 'blank',
  name: 'Blank Form',
  description: 'Start with a clean slate.',
  initialState: {
    formName: 'Untitled Form',
    formSettings: {
      description: 'description here',
      thankYouPage: true,
      notifyNpubs: [],
      publicForm: true,
      disallowAnonymous: false,
      encryptForm: true,
      viewKeyInUrl: true,
    },
    questionsList: [
       [
        'field', 
        generateFieldId(), // Use generated ID
        'text', // dataType (primitive type)
        'Untitled Question', // label
        '[]', // options (empty stringified array for non-option types)
        '{"renderElement": "shortText"}', // config (includes renderElement)
      ] as Field, // Assert type for tuple safety
    ],
  },
};

fieldCounter = 0;
