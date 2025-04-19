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
  ["1 - Poor", ""], ["2 - Fair", ""], ["3 - Average", ""], ["4 - Good", ""], ["5 - Excellent", ""]
]);

export const courseEvaluationTemplate: FormTemplate = {
  id: 'courseEvaluation',
  name: 'Course Evaluation',
  description: 'Gather student feedback on a course and instructor effectiveness.',
  initialState: {
    formName: 'Course Evaluation',
    formSettings: {
      description: 'Please provide your honest feedback about the course.',
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
        'Course Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'text',
        'Instructor Name',
        '[]',
        '{"renderElement": "shortText", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'Overall, how would you rate this course?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'option',
        'How would you rate the instructor\'s effectiveness?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'How engaging were the course materials?',
        ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'option',
        'How well were the learning objectives met?',
         ratingOptions,
        '{"renderElement": "dropdown", "required": true}',
      ] as Field,
       [
        'field',
        generateFieldId(),
        'text',
        'What did you find most valuable about this course?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
      ] as Field,
      [
        'field',
        generateFieldId(),
        'text',
        'What suggestions do you have for improving this course?',
        '[]',
        '{"renderElement": "paragraph", "required": false}',
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