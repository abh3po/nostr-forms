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

const ratingOptions = createOptionsString([
  ["1 - Very Dissatisfied", ""], ["2 - Dissatisfied", ""], ["3 - Neutral", ""], ["4 - Satisfied", ""], ["5 - Very Satisfied", ""]
]);

export const customerFeedbackTemplate: FormTemplate = {
  id: 'customerFeedback',
  name: 'Customer Feedback',
  description: 'Gather valuable insights from customers about products or services.',
  initialState: {
    formName: 'Customer Feedback',
    formSettings: {
      description: '',
      thankYouPage: true,
      notifyNpubs: [],
      publicForm: true,
      disallowAnonymous: true,
      encryptForm: true,
      viewKeyInUrl: true,
    },
    questionsList: [
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
        'text',
        'Email (Optional)',
        '[]',
        '{"renderElement": "shortText", "required": false, "validationRules": {"regex": {"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$", "errorMessage": "Please enter a valid email address."}}}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'Which product or service are you providing feedback on?',
        createOptionsString([ ["Product A", ""], ["Product B", ""], ["Service X", ""], ["General Experience", ""] ]), 
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'option',
        'Overall, how satisfied were you with our product/service?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'What did you like most about the product/service?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'How could we improve the product/service?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'How would you rate the Quality?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'How would you rate the Customer Support?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'Any other comments?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;