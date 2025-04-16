import { Input, InputNumber } from "antd";
import TextArea from "antd/es/input/TextArea";
import { ChangeEvent } from "react";
import { ChoiceFiller } from "./InputTypes/ChoiceFiller";
import { DropdownFiller } from "./InputTypes/DropdownFiller";
import { DateFiller } from "./InputTypes/DateFiller";
import { TimeFiller } from "./InputTypes/TimeFiller";
import { CountryFiller } from "./InputTypes/CountryFiller";
import { Option } from "@formstr/sdk/dist/formstr/nip101";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";

interface InputFillerProps {
  fieldConfig: any;
  options: Option[];
  onChange: (answer: string, message?: string) => void;
  defaultValue?: string | number | boolean;
}

export const InputFiller: React.FC<InputFillerProps> = ({
  fieldConfig,
  options,
  onChange,
  defaultValue,
}) => {
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  const handleValueChange = (value: string | null, message?: string) => {
    if (!value) return;
    onChange(value, message);
  };

  const getInput = (
    answerType: AnswerTypes,
    answerSettings: any
  ) => {
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
          style={{ width: "100%" }}
          placeholder="Please enter your response"
        />
      ),
      [AnswerTypes.radioButton]: (
        <ChoiceFiller
          answerType={answerType as AnswerTypes.radioButton}
          options={options}
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.checkboxes]: (
        <ChoiceFiller
          defaultValue={defaultValue as string}
          answerType={answerType as AnswerTypes.checkboxes}
          options={options}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.dropdown]: (
        <DropdownFiller
          defaultValue={defaultValue as string}
          options={options}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.date]: (
        <DateFiller
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.time]: (
        <TimeFiller
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
        />
      ),
      [AnswerTypes.country]: (
        <CountryFiller
          defaultValue={defaultValue as string}
          onChange={handleValueChange}
        />
      ),
    };

    return INPUT_TYPE_COMPONENT_MAP[answerType];
  };
 

  return <>{getInput(fieldConfig.renderElement, fieldConfig)}</>;
};
