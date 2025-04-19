import { FormTemplate } from './types';
import { Field, Option } from '../nostr/types';

let fieldCounter = 0;
let optionCounter = 0;
const generateFieldId = (): string => `template_field_${Date.now()}_${fieldCounter++}`;
const generateOptionId = (): string => `template_option_${Date.now()}_${optionCounter++}`;

export const blankQuizTemplate: FormTemplate = {
  id: 'blankQuiz',
  name: 'Blank Quiz',
  description: 'A foundation for creating customized quizzes with various question formats.',
  initialState: {
    formName: 'Untitled Quiz',
    formSettings: {
      description: 'Add your quiz questions below.',
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
        'option',
        'Sample Multiple Choice Question',
        '[["opt1","Option 1"], ["opt2","Option 2"], ["opt3","Option 3"]]', 
        '{"renderElement": "radioButton", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'text',
        'Sample Short Answer Question',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
    ],
  },
};

fieldCounter = 0;
optionCounter = 0;