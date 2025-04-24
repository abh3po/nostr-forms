import { Field, Option } from '../nostr/types';

import { FormTemplate } from './types';

let fieldCounter = 0;
let optionCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;
const generateOptionId = (): string => `template_option_${Date.now()}_${optionCounter++}`;

const createOptionsString = (options: Array<[string, string]>): string => {
  const optionsWithIds: Option[] = options.map(([label]) => [generateOptionId(), label]);
  return JSON.stringify(optionsWithIds);
};

const emailRegex = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

const eventDescription = `Event Timing: January 4th-6th, 2016
Event Address: 123 Your Street Your City, ST 12345
Contact us at (123) 456-7890 or no_reply@example.com
`;

export const eventRegistrationTemplate: FormTemplate = {
  id: 'eventRegistration',
  name: 'Event Registration',
  description: 'Register attendees for an event.',
  initialState: {
    formName: 'Event Registration',
    formSettings: {
      description: eventDescription,
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

      // Field 2: Email (Required, Short Text, Email Validation)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Email', // label
        '[]', // options
        JSON.stringify({
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

      // Field 3: Organization (Required, Short Text)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Organization', // label
        '[]', // options
        '{"renderElement": "shortText", "required": true}', // config
      ] as Field,

      // Field 4: Days Attending (Required, Multiple Choice / Checkboxes)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        'What days will you attend?', // label
        createOptionsString([
          ['Day 1', ''],
          ['Day 2', ''],
          ['Day 3', ''],
        ]), // options
        '{"renderElement": "checkboxes", "required": true}', // config
      ] as Field,

      // Field 5: Dietary Restrictions (Required, Single Choice / Radio Buttons)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        'Dietary restrictions', // label
        createOptionsString([
          ['None', ''],
          ['Vegetarian', ''],
          ['Vegan', ''],
          ['Kosher', ''],
          ['Gluten-free', ''],
          ['Other:', ''],
        ]), // options
        '{"renderElement": "radioButton", "required": true}', // config
      ] as Field,

      // Field 6: Payment Understanding (Required, Single Choice / Radio Button)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        'I understand that I will have to pay $$ upon arrival', // label
        createOptionsString([['Yes', '']]), // options (Only "Yes")
        '{"renderElement": "radioButton", "required": true}', // config
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;
