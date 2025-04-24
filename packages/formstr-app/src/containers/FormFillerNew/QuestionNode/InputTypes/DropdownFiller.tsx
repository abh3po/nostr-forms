import { Option } from '@formstr/sdk/dist/formstr/nip101';
import { Select } from 'antd';

interface DropdownFillerProps {
  options: Option[];
  onChange: (text: string) => void;
  defaultValue?: string;
}

export const DropdownFiller: React.FC<DropdownFillerProps> = ({
  options,
  onChange,
  defaultValue,
}) => {
  return (
    <>
      <Select
        onChange={onChange}
        options={options.map((choice) => {
          let [choiceId, label] = choice;
          return { value: choiceId, label: label };
        })}
        defaultValue={defaultValue}
        placeholder="Select an option"
      />
    </>
  );
};
