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
  ["1 - Very Poor", ""], ["2 - Poor", ""], ["3 - Average", ""], ["4 - Good", ""], ["5 - Excellent", ""]
]);

export const eventFeedbackTemplate: FormTemplate = {
  id: 'eventFeedback',
  name: 'Event Feedback',
  description: 'Gather detailed feedback from event attendees.',
  initialState: {
    formName: 'Event Feedback',
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
        'Overall, how would you rate the event?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'What did you like most about the event?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'What could be improved for future events?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'option',
        'How would you rate the Speakers/Presentations?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'How would you rate the Venue/Location?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'Any other comments or suggestions?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;