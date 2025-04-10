import { Checkbox } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { TextWithImages } from "../../components/Common/TextWithImages";

interface MultipleChoiceOptionsProps {
  options: Array<[string, string, string]>;
  response: string[];
  handleResponseChange: (value: string) => void;
}

export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({
  options,
  response,
  handleResponseChange,
}) => {
  const onChange = (value: string) => {
    handleResponseChange(value);
  };

  return (
    <div>
      {options.map((option) => (
        <div key={option[1]} style={{ marginBottom: "8px" }}>
          <Checkbox
            value={option[1]}
            checked={response.includes(option[1])}
            onChange={() => onChange(option[1])}
          >
            <TextWithImages content={option[2]} />
          </Checkbox>
        </div>
      ))}
    </div>
  );
};