import { Tooltip, Typography } from "antd";
import { InputFiller } from "../../../FormFillerNew/QuestionNode/InputFiller";
import { AnswerSettings, AnswerTypes, GridOptions } from "../../../../nostr/types";

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
  // Handle grid questions
  if (
    answerType === AnswerTypes.multipleChoiceGrid ||
    answerType === AnswerTypes.checkboxGrid
  ) {
    let gridOptions: GridOptions;
    try {
      gridOptions = JSON.parse(choices || '{"columns":[],"rows":[]}');
    } catch {
      gridOptions = { columns: [], rows: [] };
    }

    return (
      <Tooltip title="Select the correct answer for each row in this quiz grid">
        <div className="right-answer">
          <Text className="property-name">Right answers</Text>
          <InputFiller
            defaultValue={answerSettings?.validationRules?.match?.answer}
            options={gridOptions}
            fieldConfig={answerSettings}
            onChange={onChange}
          />
        </div>
      </Tooltip>
    );
  }

  // Parse choices - only for option-based questions
  let parsedChoices = [];
  try {
    const parsed = JSON.parse(choices || "[]");
    if (Array.isArray(parsed)) {
      parsedChoices = parsed;
    }
  } catch {
    parsedChoices = [];
  }

  const processedAnswerSettings = {
    ...answerSettings,
    choices: parsedChoices.map(([choiceId, label]: [string, string]) => ({
      choiceId,
      label,
    })),
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
          options={parsedChoices}
          fieldConfig={processedAnswerSettings}
          onChange={onChange}
        />
      </div>
    </Tooltip>
  );
};

export default RightAnswer;
