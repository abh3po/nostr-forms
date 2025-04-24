import { Choice } from './types';

export const addOption = (
  option: Choice,
  choices: Array<Choice>,
  callback: (choices: Array<Choice>) => void,
) => {
  let newChoices = [...choices, option];
  callback(newChoices);
};

export const handleDelete = (
  choiceId: string,
  choices: Array<Choice>,
  callback: (choices: Array<Choice>) => void,
) => {
  let newChoices = choices.filter((choice) => choice[0] !== choiceId);
  callback(newChoices);
};

export const handleLabelChange = (
  label: string,
  choiceId: string,
  choices: Array<Choice>,
  callback: (choices: Array<Choice>) => void,
) => {
  let newChoices = choices.map((choice) => {
    if (choice[0] === choiceId) {
      let newChoice = choice;
      newChoice[1] = label;
      return newChoice;
    }
    return choice;
  });
  callback(newChoices);
};

export const hasOtherOption = (choices: Array<Choice>) => {
  return choices.some((choice) => {
    let settings = JSON.parse(choice[2] || '{}');
    return settings.isOther;
  });
};
