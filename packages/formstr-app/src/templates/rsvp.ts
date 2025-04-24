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

const rsvpDescription = `Event Address: 123 Your Street Your City, ST 12345
Contact us at (123) 456-7890 or no_reply@example.com`;

export const rsvpTemplate: FormTemplate = {
  id: 'rsvp',
  name: 'RSVP',
  description: 'Collect attendance for an event.',
  initialState: {
    formName: 'Event RSVP',
    formSettings: {
      description: rsvpDescription,
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
        'option', // dataType
        'Can you attend?', // label
        createOptionsString([
          ["Yes, I'll be there", ''],
          ["Sorry, can't make it", ''],
        ]), // options
        '{"renderElement": "radioButton", "required": true}', // config (Radio button, required)
      ] as Field,

      // Field 2: Names of Attendees (Text / Paragraph)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'What are the names of people attending?', // label
        '[]', // options (none)
        '{"renderElement": "paragraph", "required": false}', // config (Using paragraph for potentially long list, not required)
      ] as Field,

      // Field 3: How Heard (Multiple Choice / Checkboxes)
      [
        'field',
        generateFieldId(),
        'option', // dataType
        'How did you hear about this event?', // label
        createOptionsString([
          ['Website', ''],
          ['Friend', ''],
          ['Newsletter', ''],
          ['Advertisement', ''],
        ]), // options
        '{"renderElement": "checkboxes", "required": false}', // config (Checkboxes, not required)
      ] as Field,

      // Field 4: Comments (Text / Paragraph)
      [
        'field',
        generateFieldId(),
        'text', // dataType
        'Comments and/or questions', // label
        '[]', // options (none)
        '{"renderElement": "paragraph", "required": false}', // config (Using paragraph, not required)
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;
