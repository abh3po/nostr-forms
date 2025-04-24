import { AnswerTypes } from '@formstr/sdk/dist/interfaces';

import { ReactComponent as InputIcon } from '../../../Images/Frame.svg';

import { BASIC_MENU_KEYS, INPUTS_TYPES, PRE_BUILT_MENU_KEYS } from './constants';

export const BASIC_MENU = [
  {
    key: BASIC_MENU_KEYS.TITLE,
    label: 'Label',
    icon: <InputIcon style={{ color: '#800080', fill: '#800080' }} />,
    primitive: 'label',
    answerSettings: {
      renderElement: AnswerTypes.label,
    },
  },
];

export const INPUTS_MENU = [
  {
    key: INPUTS_TYPES.SHORT_ANSWER,
    label: 'Short answer',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'text',
    answerSettings: {
      renderElement: AnswerTypes.shortText,
    },
  },
  {
    key: INPUTS_TYPES.PARAGRAPH,
    label: 'Paragraph',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'text',
    answerSettings: {
      renderElement: AnswerTypes.paragraph,
    },
  },
  {
    key: INPUTS_TYPES.NUMBER,
    label: 'Number',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'number',
    answerSettings: {
      renderElement: AnswerTypes.number,
    },
  },
  {
    key: INPUTS_TYPES.MULTIPLE_CHOICE,
    label: 'Multiple choice',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'option',
    answerSettings: {
      renderElement: AnswerTypes.checkboxes,
    },
  },
  {
    key: INPUTS_TYPES.SINGLE_CHOICE,
    label: 'Single choice',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'option',
    answerSettings: {
      renderElement: AnswerTypes.radioButton,
    },
  },
  {
    key: INPUTS_TYPES.SELECT,
    label: 'Select',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'option',
    answerSettings: {
      renderElement: AnswerTypes.dropdown,
    },
  },
  {
    key: INPUTS_TYPES.DATE,
    label: 'Date',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'text',
    answerSettings: {
      renderElement: AnswerTypes.date,
    },
  },
  {
    key: INPUTS_TYPES.TIME,
    label: 'Time',
    icon: <InputIcon style={{ color: '#FFD580', fill: '#FFD580' }} />,
    primitive: 'text',
    answerSettings: {
      renderElement: AnswerTypes.time,
    },
  },
];

export const PRE_BUILT_MENU = [
  {
    key: PRE_BUILT_MENU_KEYS.DATE_OF_BIRTH,
    label: 'Date of birth',
    icon: <InputIcon style={{ color: '#1e3f66.17', fill: '#1e3f66' }} />,
    primitive: 'text',
    answerSettings: {
      renderElement: AnswerTypes.date,
    },
  },
  {
    key: PRE_BUILT_MENU_KEYS.EMAIL,
    label: 'Email',
    icon: <InputIcon style={{ color: '#1e3f66.17', fill: '#1e3f66' }} />,
    answerSettings: {
      renderElement: AnswerTypes.shortText,
      validationRules: {
        regex: {
          pattern: '^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}',
          errorMessage: 'This is not a valid email',
        },
      },
    },
    primitive: 'text',
  },
];
