import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { Option } from "@formstr/sdk/dist/formstr/nip101";
import {
  Checkbox,
  Input,
  Radio,
  RadioChangeEvent,
  RadioGroupProps,
  Space,
} from "antd";
import { CheckboxGroupProps } from "antd/es/checkbox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import Markdown from "react-markdown";
import ChoiceFillerStyle from "./choiceFiller.style";
import { ChangeEvent, useEffect, useState } from "react";

interface ChoiceFillerProps {
  answerType: AnswerTypes.checkboxes | AnswerTypes.radioButton;
  options: Option[];
  onChange: (value: string, message: string) => void;
  defaultValue?: string;
}

export const ChoiceFiller: React.FC<ChoiceFillerProps> = ({
  answerType,
  options,
  onChange,
  defaultValue,
}) => {
  const [otherMessage, setOtherMessage] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue ? defaultValue.split(";") : []);
  
  function handleChoiceChange(e: RadioChangeEvent): void;
  function handleChoiceChange(checkedValues: CheckboxValueType[]): void;
  
  function handleChoiceChange(e: RadioChangeEvent | CheckboxValueType[]) {
    if (Array.isArray(e)) {
      const selectedChoiceIds = e as string[];
      setSelectedValues(selectedChoiceIds);
      onChange(selectedChoiceIds.sort().join(";"), "");
      return;
    }
    
    const selectedValue = e.target.value;
    setSelectedValues([selectedValue]);
    
    const selectedOption = options.find(opt => opt[0] === selectedValue);
    if (selectedOption) {
      const config = JSON.parse(selectedOption[2] || "{}") as { isOther?: boolean };
      if (config.isOther) {
        onChange(selectedValue, otherMessage);
      } else {
        onChange(selectedValue, "");
      }
    } else {
      onChange(selectedValue, "");
    }
  }

  function handleOtherInputChange(e: ChangeEvent<HTMLInputElement>) {
    const newMessage = e.target.value;
    setOtherMessage(newMessage);
    
    if (answerType === AnswerTypes.radioButton && selectedValues.length === 1) {
      onChange(selectedValues[0], newMessage);
    }
  }

  useEffect(() => {
    if (defaultValue) {
      if (answerType === AnswerTypes.checkboxes) {
        setSelectedValues(defaultValue.split(";"));
      } else {
        setSelectedValues([defaultValue]);
      }
    }
  }, [defaultValue, answerType]);

  let ElementConfig: {
    Element: typeof Radio,
    defaultValue?: RadioGroupProps['defaultValue']
  } | {
    Element: typeof Checkbox,
    defaultValue?: CheckboxGroupProps['defaultValue']
  } = {
    Element: Radio,
    defaultValue: defaultValue
  }
  
  if (answerType === AnswerTypes.checkboxes) {
    ElementConfig = {
      Element: Checkbox,
      defaultValue: defaultValue?.split(";")
    }
  }
  
  return (
    <ChoiceFillerStyle>
      <ElementConfig.Element.Group
        onChange={handleChoiceChange}
        defaultValue={ElementConfig.defaultValue}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {options.map((choice) => {
            let [choiceId, label, configString] = choice;
            let config = JSON.parse(configString || "{}") as { isOther?: boolean };
            const isOtherOption = config.isOther;
            const isSelected = selectedValues.includes(choiceId);
            
            const showOtherInput = answerType === AnswerTypes.radioButton && isOtherOption && isSelected;
            
            return (
              <div key={choiceId} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <ElementConfig.Element key={choiceId} value={choiceId}>
                    <Markdown>{isOtherOption ? "Other:" : label}</Markdown>
                  </ElementConfig.Element>
                </div>
                {showOtherInput && (
                  <div style={{ marginLeft: 24, marginTop: 4 }}>
                    <Input 
                      placeholder="Please specify..."
                      onChange={handleOtherInputChange}
                      value={otherMessage}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Space>
      </ElementConfig.Element.Group>
    </ChoiceFillerStyle>
  );
};