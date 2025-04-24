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

const partyDescription = `Party description here`;

export const partyInviteTemplate: FormTemplate = {
  id: 'partyInvite',
  name: 'Party Invite',
  description: 'Invite guests to a party.',
  initialState: {
    formName: 'Party Invite',
    formSettings: {
      description: partyDescription,
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
        'What is your name?', // label
        '[]', // options
        '{"renderElement": "shortText", "required": true}', // config
      ] as Field,

      // Field 2: Attendance (Required, Single Choice / Radio Button)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        'Can you attend?', // label
        createOptionsString([
          ["Yes, I'll be there", ''],
          ["Sorry, can't make it", ''],
        ]), // options
        '{"renderElement": "radioButton", "required": true}', // config
      ] as Field,

      // Field 3: How many attending (Not Required, Number)
      [
        'field',
        generateFieldId(),
        'number', // dataType
        'How many of you are attending?', // label
        '[]', // options
        '{"renderElement": "number", "required": false, "min": 1}', // config (min 1 if they enter a number)
      ] as Field,

      // Field 4: What bringing (Not Required, Multiple Choice / Checkboxes)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        "What will you be bringing? (Let us know what kind of dish(es) you'll be bringing)", // label (Combined for clarity)
        createOptionsString([
          ['Mains', ''],
          ['Salad', ''],
          ['Dessert', ''],
          ['Drinks', ''],
          ['Sides/Appetizers', ''],
          ['Other:', ''], // Included "Other" as a standard option
        ]), // options
        '{"renderElement": "checkboxes", "required": false}', // config
      ] as Field,

      // Field 5: Allergies (Not Required, Paragraph)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Do you have any allergies or dietary restrictions?', // label
        '[]', // options
        '{"renderElement": "paragraph", "required": false}', // config
      ] as Field,

      // Field 6: Email (Not Required, Short Text, Email Validation)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'What is your email address?', // label
        '[]', // options
        JSON.stringify({
          // Stringify the config object
          renderElement: 'shortText',
          required: false, // Set to false as per field list
          validationRules: {
            regex: {
              pattern: emailRegex,
              errorMessage: 'Please enter a valid email address.',
            },
          },
        }), // config
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;
