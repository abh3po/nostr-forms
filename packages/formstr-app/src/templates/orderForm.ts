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

export const orderFormTemplate: FormTemplate = {
  id: 'orderForm',
  name: 'Order Form',
  description: 'Allow customers to easily place orders for goods or services.',
  initialState: {
    formName: 'Order Form',
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
        'text',
        'Shipping Address',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'option',
        'Select Items',
        createOptionsString([
          ["Item 1 - $10", ""], ["Item 2 - $15", ""], ["Item 3 - $20", ""], ["Service A - $50", ""]
        ]), 
        '{"renderElement": "checkboxes", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'number',
        'Quantity (If applicable, clarify which item)',
        '[]',
        '{"renderElement": "number", "required": false, "min": 1}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Special Instructions (Optional)',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'Payment Method (Details handled separately)',
        createOptionsString([ ["Invoice", ""], ["Credit Card (Offline)", ""], ["Other", ""] ]),
        '{"renderElement": "dropdown", "required": false}', 
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;