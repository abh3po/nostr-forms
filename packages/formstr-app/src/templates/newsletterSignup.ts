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

export const newsletterSignupTemplate: FormTemplate = {
  id: 'newsletterSignup',
  name: 'Newsletter Sign-up',
  description: 'Gather email addresses for a newsletter or mailing list.',
  initialState: {
    formName: 'Subscribe to Our Newsletter',
    formSettings: {
      description: 'Stay updated with our latest news and offers!',
      thankYouPage: true,
      notifyNpubs: [],
      publicForm: true,
      disallowAnonymous: false, 
      encryptForm: false, 
      viewKeyInUrl: false,
    },
    questionsList: [
      [ 
        'field',
        generateFieldId(),
        'text',
        'Email Address',
        '[]',
        '{"renderElement": "shortText", "required": true, "validationRules": {"regex": {"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$", "errorMessage": "Please enter a valid email address."}}}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'Name (Optional)',
        '[]',
        '{"renderElement": "shortText", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'Topics of Interest (Optional)',
         createOptionsString([ ["Product Updates", ""], ["Special Offers", ""], ["Company News", ""], ["Events", ""] ]),
        '{"renderElement": "checkboxes", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;