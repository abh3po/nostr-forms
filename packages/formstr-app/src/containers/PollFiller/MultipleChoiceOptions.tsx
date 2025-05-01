import { AnswerTypes } from "@formstr/sdk/dist/interfaces";
import { Option } from "@formstr/sdk/dist/formstr/nip101";
import { useState, useEffect } from "react";
import { ChoiceFiller } from "../../containers/FormFillerNew/QuestionNode/InputTypes/ChoiceFiller";

interface MultipleChoiceOptionsProps {
  options: Array<[string, string, string]>; 
  response: string[];
  handleResponseChange: (value: string) => void;
  allowMultiple?: boolean;
}

export const MultipleChoiceOptions: React.FC<MultipleChoiceOptionsProps> = ({
  options,
  response,
  handleResponseChange,
  allowMultiple = true,
}) => {
  
  const convertToOptions = (): Option[] => {
    return options.map(option => {
      return [option[1], option[2], "{}"];
    });
  };

  const [currentOptions] = useState<Option[]>(convertToOptions());
  

  const getDefaultValue = (): string => {
    return allowMultiple ? response.join(";") : response[0] || "";
  };


  const handleChoiceChange = (value: string, message: string) => {
    if (allowMultiple) {
      const selectedValues = value ? value.split(";") : [];

      selectedValues.forEach(val => {
        if (!response.includes(val)) {
          handleResponseChange(val);
        }
      });
      
      response.forEach(val => {
        if (!selectedValues.includes(val)) {
          handleResponseChange(val); 
        }
      });
    } else {
      handleResponseChange(value);
    }
  };

  return (
    <ChoiceFiller
      answerType={allowMultiple ? AnswerTypes.checkboxes : AnswerTypes.radioButton}
      options={currentOptions}
      onChange={handleChoiceChange}
      defaultValue={getDefaultValue()}
    />
  );
};