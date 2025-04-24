import { V1AnswerSettings } from '@formstr/sdk/dist/interfaces';
import { Select } from 'antd';

interface DropdownFillerProps {
  answerSettings: V1AnswerSettings;
  onChange: (text: string) => void;
  defaultValue?: string;
}

export const DropdownFiller: React.FC<DropdownFillerProps> = ({
  answerSettings,
  onChange,
  defaultValue,
}) => {
  return (
    <>
      <Select
        onChange={onChange}
        options={answerSettings.choices?.map((choice) => {
          return { value: choice.choiceId, label: choice.label };
        })}
        defaultValue={defaultValue}
        placeholder="Select an option"
      />
    </>
  );
};
