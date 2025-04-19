import { FormTemplate } from './types';
import { Field, Option } from '../nostr/types';

let fieldCounter = 0;
let optionCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;
const generateOptionId = (): string => `template_option_${Date.now()}_${optionCounter++}`;

export const assessmentTemplate: FormTemplate = {
  id: 'assessment',
  name: 'Assessment',
  description: 'Create structured tests and assignments with instructions.',
  initialState: {
    formName: 'Untitled Assessment',
    formSettings: {
      description: 'Follow the instructions below to complete the assessment.',
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
        'Student Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'Instructions', 
        '[]',
        '{"renderElement": "paragraph", "required": false, "placeholder": "Please read all questions carefully..."}', 
      ] as Field,
       [
        'field',
        generateFieldId(),
        'option',
        'Question 1: Sample Multiple Choice',
        '[["optA","Answer A"], ["optB","Answer B"], ["optC","Answer C"]]', 
        '{"renderElement": "radioButton", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'text',
        'Question 2: Sample Short Answer',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
        [
        'field',
        generateFieldId(),
        'text',
        'Question 3: Sample Essay Question',
        '[]',
        '{"renderElement": "paragraph", "required": true}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;