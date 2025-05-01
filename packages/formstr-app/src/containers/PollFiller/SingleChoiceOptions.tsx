import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { Option } from "@formstr/sdk/dist/formstr/nip101";
import { useState } from "react";
import { ChoiceFiller } from "../../containers/FormFillerNew/QuestionNode/InputTypes/ChoiceFiller";

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
  const convertToOptions = (): Option[] => {
    return options.map(option => {
      return [option[1], option[2], "{}"];
    });
  };

  const [currentOptions] = useState<Option[]>(convertToOptions());

  const getDefaultValue = (): string => {
    return response[0] || "";
  };

  const handleChoiceChange = (value: string, message: string) => {
    handleResponseChange(value);
  };

  return (
    <ChoiceFiller
      answerType={AnswerTypes.radioButton}
      options={currentOptions}
      onChange={handleChoiceChange}
      defaultValue={getDefaultValue()}
    />
  );
};