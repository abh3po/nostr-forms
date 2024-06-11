import { CloseOutlined } from "@ant-design/icons";
import { Checkbox, Input } from "antd";
import { useState } from "react";
import OptionsStyle from "./Options.style";
import { AddOption } from "./AddOption";
import { handleDelete, handleLabelChange, hasOtherOption } from "./utils";
import { Choice, ChoiceSettings } from "./types";

interface CheckboxCreatorProps {
  initialValues?: Array<Choice>;
  onValuesChange: (options: Choice[]) => void;
}

export const CheckboxCreator: React.FC<CheckboxCreatorProps> = ({
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
        return (
          <div className="radioButtonItem" key={choiceId}>
            <Checkbox disabled key={choiceId + "checkbox"} />
            <Input
              key={choiceId + "input"}
              defaultValue={label}
              onChange={(e) => {
                handleLabelChange(
                  e.target.value,
                  choiceId!,
                  choices,
                  handleNewChoices
                );
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
                key={choiceId + "close"}
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
