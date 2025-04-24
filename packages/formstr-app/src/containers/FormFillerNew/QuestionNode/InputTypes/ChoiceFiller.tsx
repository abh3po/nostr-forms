import { Option } from '@formstr/sdk/dist/formstr/nip101';
import { AnswerTypes } from '@formstr/sdk/dist/interfaces';
import { Checkbox, Input, Radio, RadioChangeEvent, RadioGroupProps, Space } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { ChangeEvent, useState } from 'react';
import Markdown from 'react-markdown';

import ChoiceFillerStyle from './choiceFiller.style';

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
  const [otherMessage, setOtherMessage] = useState('');

  function handleChoiceChange(e: RadioChangeEvent): void;

  function handleChoiceChange(checkedValues: CheckboxValueType[]): void;

  function handleChoiceChange(e: RadioChangeEvent | CheckboxValueType[]) {
    if (Array.isArray(e)) {
      onChange(e.sort().join(';'), otherMessage);
      return;
    }
    onChange(e.target.value, otherMessage);
  }

  function handleMessage(e: ChangeEvent<HTMLInputElement>) {
    setOtherMessage(e.target.value);
  }

  let ElementConfig:
    | {
        Element: typeof Radio;
        defaultValue?: RadioGroupProps['defaultValue'];
      }
    | {
        Element: typeof Checkbox;
        defaultValue?: CheckboxGroupProps['defaultValue'];
      } = {
    Element: Radio,
    defaultValue: defaultValue,
  };
  if (answerType === AnswerTypes.checkboxes) {
    ElementConfig = {
      Element: Checkbox,
      defaultValue: defaultValue?.split(';'),
    };
  }
  return (
    //@ts-ignore
    <ChoiceFillerStyle>
      <ElementConfig.Element.Group
        onChange={handleChoiceChange}
        defaultValue={ElementConfig.defaultValue}
      >
        <Space direction="vertical">
          {options.map((choice) => {
            let [choiceId, label, configString] = choice;
            let config = JSON.parse(configString || '{}');
            return (
              <ElementConfig.Element key={choiceId} value={choiceId}>
                <Markdown>{label}</Markdown>
                {config.isOther && (
                  <Input placeholder="Add an optional message..." onInput={handleMessage} />
                )}
              </ElementConfig.Element>
            );
          })}
        </Space>
      </ElementConfig.Element.Group>
    </ChoiceFillerStyle>
  );
};
