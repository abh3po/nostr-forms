import { CaretDownOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, MenuProps } from "antd";
import { useState } from "react";
import OptionsStyle from "./Options.style";
import { AddOption } from "./AddOption";
import { handleDelete, handleLabelChange } from "./utils";
import { MenuItemType } from "antd/es/menu/hooks/useItems";
import { Choice, ChoiceSettings } from "./types";

interface RadioButtonCreatorProps {
  initialValues?: Array<Choice>;
  onValuesChange: (options: Choice[]) => void;
}

export const DropdownCreator: React.FC<RadioButtonCreatorProps> = ({
  initialValues,
  onValuesChange,
}) => {
  const [choices, setChoices] = useState<Array<Choice>>(initialValues || []);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleNewChoices = (choices: Array<Choice>) => {
    setChoices(choices);
    onValuesChange(choices);
    setIsOpen(true);
  };

  const getMenuItems = (): MenuProps["items"] => {
    return choices.map((choice) => {
      let [choiceId, label, settingsString] = choice;
      let settings = JSON.parse(settingsString || "{}") as ChoiceSettings;
      const isOtherOption = settings.isOther;
      
      return {
        label: (
          <div className="radioButtonItem" key={choiceId}>
            <Input
              defaultValue={isOtherOption ? "Other" : label}
              key={choiceId}
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
            <div>
              {choices.length >= 2 && (
                <CloseOutlined
                  onClick={(e) => {
                    handleDelete(choiceId!, choices, handleNewChoices);
                  }}
                  style={{ marginLeft: 8 }}
                />
              )}
            </div>
          </div>
        ),
        key: choiceId,
      } as MenuItemType;
    });
  };
  
  return (
    <OptionsStyle>
      <Dropdown
        menu={{ items: getMenuItems(), onClick: () => {} }}
        open={isOpen}
        className="dropdown"
        onOpenChange={(nextOpen, info) => {
          if (info.source === "trigger") setIsOpen(nextOpen);
        }}
      >
        <Button onClick={(e) => e.preventDefault()}>
          Options {"( "}
          {choices.length} {" )"} <CaretDownOutlined />
        </Button>
      </Dropdown>
      <AddOption
        disable={choices.some((choice) => {
          let [choiceId, label, settingsString] = choice;
          return label === "";
        })}
        choices={choices}
        callback={handleNewChoices}
        displayOther={false}
      />
    </OptionsStyle>
  );
};