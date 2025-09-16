import ShortText from "./InputElements/ShortText";
import { RadioButtonCreator } from "./InputElements/OptionTypes/RadioButtonCreator";
import { CheckboxCreator } from "./InputElements/OptionTypes/CheckBoxCreator";
import { DropdownCreator } from "./InputElements/OptionTypes/DropdownCreator";
import { DatePicker, Input, InputNumber, TimePicker } from "antd";
import { Choice } from "./InputElements/OptionTypes/types";
import { AnswerSettings, AnswerTypes } from "../../../../nostr/types";

interface InputsProps {
  inputType: string;
  options: Array<Choice>;
  answerSettings: AnswerSettings;
  answerSettingsHandler: (answerSettings: AnswerSettings) => void;
  optionsHandler: (options: Array<Choice>) => void;
}

const Inputs: React.FC<InputsProps> = ({
  inputType,
  options,
  answerSettings,
  answerSettingsHandler,
  optionsHandler,
}) => {
  const updateAnswerSettings = (settingKey: string, property: unknown) => {
    let newAnswerSettings = { ...answerSettings, [settingKey]: property };
    answerSettingsHandler(newAnswerSettings);
  };
  const getInputElement = () => {
    switch (inputType) {
      case AnswerTypes.shortText:
        return (
          <>
            <ShortText />
          </>
        );
      case AnswerTypes.paragraph:
        return <Input.TextArea disabled={true} />;
      case AnswerTypes.number:
        return <InputNumber disabled={true} />;
      case AnswerTypes.radioButton:
        return (
          <RadioButtonCreator
            initialValues={options}
            onValuesChange={optionsHandler}
          />
        );
      case AnswerTypes.checkboxes:
        return (
          <CheckboxCreator
            initialValues={options}
            onValuesChange={optionsHandler}
          />
        );
      case AnswerTypes.dropdown:
        return (
          <DropdownCreator
            initialValues={options}
            onValuesChange={optionsHandler}
          />
        );
      case AnswerTypes.date:
        return <DatePicker disabled={true} />;
      case AnswerTypes.time:
        return <TimePicker disabled={true} />;
      default:
        <></>;
        break;
    }
  };
  return <>{getInputElement()}</>;
};

export default Inputs;
