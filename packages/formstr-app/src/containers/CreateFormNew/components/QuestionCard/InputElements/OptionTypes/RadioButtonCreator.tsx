import { CloseOutlined } from '@ant-design/icons';
import { Input, Radio } from 'antd';
import { useState } from 'react';

import { AddOption } from './AddOption';
import OptionsStyle from './Options.style';
import { Choice, ChoiceSettings } from './types';
import { handleDelete, handleLabelChange, hasOtherOption } from './utils';

interface RadioButtonCreatorProps {
  initialValues?: Array<Choice>;
  onValuesChange: (options: Choice[]) => void;
}

export const RadioButtonCreator: React.FC<RadioButtonCreatorProps> = ({
  initialValues,
  onValuesChange,
}) => {
  const [choices, setChoices] = useState<Array<Choice>>(initialValues || []);

  const handleNewChoices = (choices: Array<Choice>) => {
    setChoices(choices);
    onValuesChange(choices);
  };

  return (
    <OptionsStyle>
      {choices?.map((choice) => {
        console.log('Choice is', choice);
        let [choiceId, label, settingsString] = choice;
        let settings = JSON.parse(settingsString || '{}') as ChoiceSettings;
        return (
          <div className="radioButtonItem" key={choiceId}>
            <Radio disabled key={choiceId + 'choice'} />
            <Input
              key={choiceId + 'input'}
              defaultValue={label}
              onChange={(e) => {
                handleLabelChange(e.target.value, choiceId, choices, handleNewChoices);
              }}
              placeholder="Enter an option"
              className="choice-input"
              disabled={settings.isOther}
            />
            {choices.length >= 2 && (
              <CloseOutlined
                onClick={(e) => {
                  handleDelete(choiceId!, choices, handleNewChoices);
                }}
              />
            )}
          </div>
        );
      })}
      <AddOption
        disable={choices.some((choice) => {
          let [choiceId, label, settingsString] = choice;
          return label === '';
        })}
        choices={choices}
        callback={handleNewChoices}
        displayOther={!hasOtherOption(choices)}
      />
    </OptionsStyle>
  );
};
