// TODO: this should be an enum
const CreateFormTab = {
  addQuestion: 'addQuestion',
  settings: 'Settings',
};

const ResponseFilters = {
  allResponses: 'allResponses',
  selfSignedResponses: 'selfSignedResponses',
};

const AnswerTypes = {
  string: 'string',
  text: 'text',
  singleChoice: 'singleChoice',
  multipleChoice: 'multipleChoice',
  number: 'number',
  date: 'date',
  label: 'label',
};

const tabList = [
  {
    key: CreateFormTab.addQuestion,
    label: 'Add Questions',
  },
  {
    key: CreateFormTab.settings,
    label: 'Settings',
  },
];

const DEVICE_TYPE = {
  MOBILE: 'MOBILE',
  TABLET: 'TABLET',
  DESKTOP: 'DESKTOP',
};

const DEVICE_WIDTH = {
  [DEVICE_TYPE.MOBILE]: 767,
  [DEVICE_TYPE.TABLET]: 1024,
};

module.exports = {
  CreateFormTab,
  ResponseFilters,
  AnswerTypes,
  tabList,
  DEVICE_TYPE,
  DEVICE_WIDTH,
};
