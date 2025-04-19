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

export const workRequestTemplate: FormTemplate = {
  id: 'workRequest',
  name: 'Work Request',
  description: 'Streamline internal requests between teams.',
  initialState: {
    formName: 'Work Request',
    formSettings: {
      description: '',
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
        'Department/Team',
        createOptionsString([ ["Sales", ""], ["Marketing", ""], ["IT", ""], ["HR", ""], ["Design", ""], ["Other", ""] ]), 
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'Type of Request',
        createOptionsString([ ["IT Support", ""], ["Design Request", ""], ["Marketing Assistance", ""], ["Data Analysis", ""], ["Other", ""] ]), 
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Subject of Request',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'Detailed Description of Request',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'option',
        'Priority',
        createOptionsString([ ["High", ""], ["Medium", ""], ["Low", ""] ]),
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;