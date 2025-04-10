import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { TextWithImages } from "../../components/Common/TextWithImages";

interface SingleChoiceOptionsProps {
  options: Array<[string, string, string]>;
  response: string[];
  handleResponseChange: (value: string) => void;
}

export const SingleChoiceOptions: React.FC<SingleChoiceOptionsProps> = ({
  options,
  response,
  handleResponseChange,
}) => {
  const onChange = (e: RadioChangeEvent) => {
    handleResponseChange(e.target.value);
  };

  return (
    <Radio.Group 
      value={response[0]} 
      defaultValue={response[0]} 
      onChange={onChange}
    >
      {options.map((option) => (
        <Radio 
          key={option[1]} 
          value={option[1]}
        >
          <TextWithImages content={option[2]} />
        </Radio>
      ))}
    </Radio.Group>
  );
};