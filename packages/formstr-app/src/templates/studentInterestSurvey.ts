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

export const studentInterestSurveyTemplate: FormTemplate = {
  id: 'studentInterestSurvey',
  name: 'Student Interest Survey',
  description: 'Understand students\' interests, preferences, and areas for enrichment.',
  initialState: {
    formName: 'Student Interest Survey',
    formSettings: {
      description: 'Help us get to know you better!',
      thankYouPage: true,
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
        'option',
        'Grade Level',
        createOptionsString([ ["Grade 6",""], ["Grade 7",""], ["Grade 8",""], ["Grade 9",""], ["Grade 10",""], ["Grade 11",""], ["Grade 12",""], ["Other",""] ]),
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'option',
        'What subjects do you enjoy the most?',
        createOptionsString([ ["Math",""], ["Science",""], ["English/Language Arts",""], ["History/Social Studies",""], ["Art",""], ["Music",""], ["Physical Education",""], ["Technology",""], ["Other",""] ]),
        '{"renderElement": "checkboxes", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'What are your favorite hobbies or activities outside of school?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
      [ 
        'field',
        generateFieldId(),
        'text',
        'What are you most interested in learning about?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'What are your career interests (if any)?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
       [ 
        'field',
        generateFieldId(),
        'text',
        'Are there any clubs or activities you would like to see offered at school?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;