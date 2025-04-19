import { FormTemplate } from './types';
import { Field, Option } from '../nostr/types';

let fieldCounter = 0;
let optionCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;
const generateOptionId = (): string => `template_option_${Date.now()}_${optionCounter++}`;

export const meetingNotesTemplate: FormTemplate = {
  id: 'meetingNotes',
  name: 'Meeting Notes',
  description: 'Collaboratively capture key information and action items during meetings.',
  initialState: {
    formName: 'Meeting Notes',
    formSettings: {
      description: 'Record agenda, attendees, discussion points, and action items.',
      thankYouPage: false,
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
        'Meeting Title',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      
       [ 
        'field',
        generateFieldId(),
        'text',
        'Attendees',
        '[]',
        '{"renderElement": "paragraph", "required": false}', 
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Agenda Items',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Notes / Discussion Points',
        '[]',
        '{"renderElement": "paragraph", "required": false}', 
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Action Items (Task - Owner - Due Date)',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Decisions Made',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Next Steps / Follow Up',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;