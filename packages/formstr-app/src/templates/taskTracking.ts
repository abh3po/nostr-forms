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

export const taskTrackingTemplate: FormTemplate = {
  id: 'taskTracking',
  name: 'Task Tracking',
  description: 'Organize and track project tasks, responsibilities, and progress.',
  initialState: {
    formName: 'Project Task Tracker',
    formSettings: {
      description: 'Log and update project tasks.',
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
        'Project Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Task Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Task Description',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'Assigned To',
        createOptionsString([ ["User A", ""], ["User B", ""], ["Team 1", ""], ["Unassigned", ""] ]), 
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'Status',
         createOptionsString([ ["To Do", ""], ["In Progress", ""], ["Blocked", ""], ["In Review", ""], ["Completed", ""] ]),
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'option',
        'Priority',
        createOptionsString([ ["High", ""], ["Medium", ""], ["Low", ""], ["Optional", ""] ]),
        '{"renderElement": "dropdown", "required": false}',
      ] as Field,
       
      [ 
        'field',
        generateFieldId(),
        'number',
        'Progress (%)',
        '[]',
        '{"renderElement": "number", "required": false, "min": 0, "max": 100}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Notes/Comments',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;