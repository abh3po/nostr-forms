import { V1AnswerSettings, AnswerTypes } from '@formstr/sdk/dist/interfaces';
import { Checkbox, Radio, RadioChangeEvent, RadioGroupProps, Space } from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import Markdown from 'react-markdown';

import ChoiceFillerStyle from './choiceFiller.style';

interface ChoiceFillerProps {
  answerType: AnswerTypes.checkboxes | AnswerTypes.radioButton;
  answerSettings: V1AnswerSettings;
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const ChoiceFiller: React.FC<ChoiceFillerProps> = ({
  answerType,
  answerSettings,
  onChange,
  defaultValue,
}) => {
  function handleChoiceChange(e: RadioChangeEvent): void;

  function handleChoiceChange(checkedValues: CheckboxValueType[]): void;

  function handleChoiceChange(e: RadioChangeEvent | CheckboxValueType[]) {
    if (Array.isArray(e)) {
      onChange(e.sort().join(';'));
      return;
    }
    onChange(e.target.value);
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
          {answerSettings.choices?.map((choice) => {
            return (
              <ElementConfig.Element key={choice.choiceId} value={choice.choiceId}>
                <Markdown>{choice.label}</Markdown>
              </ElementConfig.Element>
            );
          })}
        </Space>
      </ElementConfig.Element.Group>
    </ChoiceFillerStyle>
  );
};
