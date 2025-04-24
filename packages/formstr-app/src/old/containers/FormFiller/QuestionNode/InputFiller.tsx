import { V1AnswerSettings, AnswerTypes } from '@formstr/sdk/dist/interfaces';
import { Input, InputNumber } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { ChangeEvent } from 'react';

import { ChoiceFiller } from './InputTypes/ChoiceFiller';
import { DateFiller } from './InputTypes/DateFiller';
import { DropdownFiller } from './InputTypes/DropdownFiller';
import { TimeFiller } from './InputTypes/TimeFiller';

interface InputFillerProps {
  answerType: AnswerTypes;
  answerSettings: V1AnswerSettings;
  onChange: (answer: string, message?: string) => void;
  defaultValue?: string | number | boolean;
}

export const InputFiller: React.FC<InputFillerProps> = ({
  answerType,
  answerSettings,
  onChange,
  defaultValue,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleValueChange = (value: string | null) => {
    if (!value) return;
    onChange(value);
  };

  const getInput = (answerType: AnswerTypes, answerSettings: V1AnswerSettings) => {
    const INPUT_TYPE_COMPONENT_MAP: { [key in AnswerTypes]?: JSX.Element } = {
      [AnswerTypes.label]: <></>,
      [AnswerTypes.shortText]: (
        <Input
          defaultValue={defaultValue as string}
          onChange={handleInputChange}
          placeholder="Please enter your response"
        />
      ),
      [AnswerTypes.paragraph]: (
        <TextArea
          defaultValue={defaultValue as string}
          onChange={handleInputChange}
          placeholder="Please enter your response"
        />
      ),
      [AnswerTypes.number]: (
        <InputNumber
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
          style={{ width: '100%' }}
          placeholder="Please enter your response"
        />
      ),
      [AnswerTypes.radioButton]: (
        <ChoiceFiller
          answerType={answerType as AnswerTypes.radioButton}
          answerSettings={answerSettings}
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.checkboxes]: (
        <ChoiceFiller
          defaultValue={defaultValue as string}
          answerType={answerType as AnswerTypes.checkboxes}
          answerSettings={answerSettings}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.dropdown]: (
        <DropdownFiller
          defaultValue={defaultValue as string}
          answerSettings={answerSettings}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.date]: (
        <DateFiller defaultValue={defaultValue as string} onChange={handleValueChange} />
      ),
      [AnswerTypes.time]: (
        <TimeFiller defaultValue={defaultValue as string} onChange={handleValueChange} />
      ),
    };

    return INPUT_TYPE_COMPONENT_MAP[answerType];
  };

  return <>{getInput(answerType, answerSettings)}</>;
};
