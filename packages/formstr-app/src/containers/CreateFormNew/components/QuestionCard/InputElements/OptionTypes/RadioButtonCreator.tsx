import { CloseOutlined } from "@ant-design/icons";
import { Input, Radio } from "antd";
import { useState } from "react";
import OptionsStyle from "./Options.style";
import { AddOption } from "./AddOption";
import { handleDelete, handleLabelChange, hasOtherOption } from "./utils";
import { Choice, ChoiceSettings } from "./types";

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
        let [choiceId, label, settingsString] = choice;
        let settings = JSON.parse(settingsString || "{}") as ChoiceSettings;
        const isOtherOption = settings.isOther;
        
        return (
          <div className="radioButtonItem" key={choiceId}>
            <Radio disabled key={choiceId + "choice"} />
            <Input
              key={choiceId + "input"}
              defaultValue={isOtherOption ? "Other" : label}
              onChange={(e) => {
                handleLabelChange(
                  e.target.value,
                  choiceId,
                  choices,
                  handleNewChoices
                );
              }}
              placeholder={isOtherOption ? "Other" : "Enter an option"}
              className="choice-input"
              disabled={isOtherOption}
            />
            {isOtherOption && (
              <Input 
                placeholder="Form filler will write here..."
                disabled={true}
                style={{ marginLeft: 8, width: '180px', opacity: 0.6 }}
              />
            )}
            {choices.length >= 2 && (
              <CloseOutlined
                onClick={(e) => {
                  handleDelete(choiceId!, choices, handleNewChoices);
                }}
                style={{ marginLeft: 8 }}
              />
            )}
          </div>
        );
      })}
      <AddOption
        disable={choices.some((choice) => {
          let [choiceId, label, settingsString] = choice;
          return label === "";
        })}
        choices={choices}
        callback={handleNewChoices}
        displayOther={!hasOtherOption(choices)}
      />
    </OptionsStyle>
  );
};