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


const understandingOptions = createOptionsString([
  ["1 - Not at all", ""], ["2 - A little", ""], ["3 - Fairly well", ""], ["4 - Mostly", ""], ["5 - Completely", ""]
]);


export const exitTicketTemplate: FormTemplate = {
  id: 'exitTicket',
  name: 'Exit Ticket',
  description: 'Quickly gauge student understanding at the end of a lesson.',
  initialState: {
    formName: 'Exit Ticket',
    formSettings: {
      description: 'Please answer the following questions about today\'s lesson.',
      thankYouPage: false,
      notifyNpubs: [],
      publicForm: false, 
      disallowAnonymous: false, 
      encryptForm: true,
      viewKeyInUrl: true,
    },
    questionsList: [
       [ 
        'field',
        generateFieldId(),
        'text',
        'Your Name (Optional)',
        '[]',
        '{"renderElement": "shortText", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'What was the most important thing you learned today?',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'What is one question you still have?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'How well did you understand today\'s lesson?',
        understandingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Any other thoughts or comments?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;