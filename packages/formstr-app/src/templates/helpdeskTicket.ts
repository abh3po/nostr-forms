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

export const helpdeskTicketTemplate: FormTemplate = {
  id: 'helpdeskTicket',
  name: 'Helpdesk Ticket',
  description: 'Report technical or support issues with relevant details.',
  initialState: {
    formName: 'Submit a Support Ticket',
    formSettings: {
      description: 'Please provide details about the issue you are experiencing.',
      thankYouPage: true,
      notifyNpubs: [], 
      publicForm: false, 
      disallowAnonymous: true,
      encryptForm: true,
      viewKeyInUrl: true,
    },
    questionsList: [
      [ 
        'field',
        generateFieldId(),
        'text',
        'Your Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Your Email',
        '[]',
        '{"renderElement": "shortText", "required": true, "validationRules": {"regex": {"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$", "errorMessage": "Please enter a valid email address."}}}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'Department (Optional)',
        createOptionsString([ ["Sales", ""], ["Marketing", ""], ["IT", ""], ["HR", ""], ["Finance", ""], ["Other", ""] ]), 
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Subject of Issue',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Description of Issue',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'option',
        'Severity',
         createOptionsString([ ["Critical - System Down", ""], ["High - Significant Impact", ""], ["Medium - Minor Impact", ""], ["Low - Inquiry/Question", ""] ]),
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Operating System / Device (Optional)',
        '[]',
        '{"renderElement": "shortText", "required": false}',
      ] as Field,
      
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;