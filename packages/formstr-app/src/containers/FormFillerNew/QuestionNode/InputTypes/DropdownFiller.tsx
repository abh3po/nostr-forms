import { Option } from "@formstr/sdk/dist/formstr/nip101";
import { Select } from "antd";

interface DropdownFillerProps {
  options: Option[];
  onChange: (text: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export const DropdownFiller: React.FC<DropdownFillerProps> = ({
  options,
  onChange,
  defaultValue,
  disabled = false,
}) => {
  return (
    <>
      <Select
        onChange={onChange}
        options={options.map((choice) => {
          let [choiceId, label] = choice;
          return { value: choiceId, label: label };
        })}
        value={defaultValue}
        placeholder="Select an option"
        disabled={disabled}
      />
    </>
  );
};
