import { FormTemplate } from './types';
import { Field, Option } from '../nostr/types';

let fieldCounter = 0;
let optionCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;
const generateOptionId = (): string => `template_option_${Date.now()}_${optionCounter++}`;

const createOptionsString = (options: Array<[string, string]>): string => {
    const optionsWithIds: Option[] = options.map(([label]) => [generateOptionId(), label]);
    return JSON.stringify(optionsWithIds);
};

export const tshirtSignupTemplate: FormTemplate = {
  id: 'tshirtSignup',
  name: 'T-Shirt Sign-Up',
  description: 'Simplify collecting t-shirt orders, including sizes and quantities.',
  initialState: {
    formName: 'T-Shirt Sign-Up',
    formSettings: {
      description: '',
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
        generateFieldId(),
        'text',
        'Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Email',
        '[]',
        '{"renderElement": "shortText", "required": true, "validationRules": {"regex": {"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$", "errorMessage": "Please enter a valid email address."}}}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'option',
        'T-Shirt Size',
        createOptionsString([
          ["S", ""], ["M", ""], ["L", ""], ["XL", ""], ["XXL", ""], ["Other", ""]
        ]),
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'number',
        'Quantity',
        '[]',
        '{"renderElement": "number", "required": true, "min": 1}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Additional Comments (Optional)',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;