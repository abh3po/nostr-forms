import { Tooltip, Typography } from "antd";
import { InputFiller } from "../../../FormFillerNew/QuestionNode/InputFiller";
import { AnswerSettings, AnswerTypes } from "../../../../nostr/types";

const { Text } = Typography;

interface RightAnswerProps {
  answerType: AnswerTypes;
  answerSettings: AnswerSettings;
  choices?: string;
  onChange: (answer: string | string[]) => void;
}

export const RightAnswer: React.FC<RightAnswerProps> = ({
  answerType,
  answerSettings,
  choices,
  onChange,
}) => {
  const processedAnswerSettings = {
    ...answerSettings,
    choices: choices
      ? JSON.parse(choices).map(([choiceId, label]: [string, string]) => ({
          choiceId,
          label,
        }))
      : [],
  };

  const isMultipleChoice = answerType === AnswerTypes.checkboxes;

  return (
    <Tooltip
      title={`Select the correct answer${
        isMultipleChoice ? "s" : ""
      } for this quiz question`}
    >
      <div className="right-answer">
        <Text className="property-name">
          Right answer{isMultipleChoice ? "s" : ""}
        </Text>
        <InputFiller
          defaultValue={answerSettings?.validationRules?.match?.answer}
          options={
            choices
              ? JSON.parse(choices).map(
                  ([choiceId, label, configString]: [
                    string,
                    string,
                    string,
                  ]) => ({
                    choiceId,
                    label,
                    configString,
                  }),
                )
              : []
          }
          fieldConfig={processedAnswerSettings}
          onChange={onChange}
        />
      </div>
    </Tooltip>
  );
};

export default RightAnswer;
