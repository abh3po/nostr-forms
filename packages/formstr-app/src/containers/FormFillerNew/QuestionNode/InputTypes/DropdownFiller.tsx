import { Select } from "antd";
import { Choice } from "../../../../nostr/types";

interface DropdownFillerProps {
  options: Choice[];
  onChange: (text: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  testId?: string;
}

export const DropdownFiller: React.FC<DropdownFillerProps> = ({
  options,
  onChange,
  defaultValue,
  disabled = false,
  testId = "dropdown-filler",
}) => {
  return (
    <>
      <Select
        onChange={onChange}
        options={options.map((choice) => {
          let { choiceId, label } = choice;
          return { value: choiceId, label: label };
        })}
        value={defaultValue}
        placeholder="Select an option"
        disabled={disabled}
        data-testid={`${testId}:select`}
      />
    </>
  );
};
