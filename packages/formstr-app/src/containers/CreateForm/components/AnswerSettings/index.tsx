import { Button, Divider, Dropdown, Switch, Typography, MenuProps } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { AnswerSettings as IAnswerSettings } from "@formstr/sdk/dist/interfaces";
import Validation from "../Validation";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { INPUTS_MENU } from "../../configs/menuConfig";
import StyleWrapper from "./style";
import { RightAnswer } from "./RightAnswer";

const { Text } = Typography;

function AnswerSettings() {
  const { questionsList, questionIdInFocus, editQuestion, deleteQuestion } =
    useFormBuilderContext();
  const questionIndex = questionsList.findIndex(
    (question) => question.tempId === questionIdInFocus
  );
  const question = questionsList[questionIndex];
  const answerSettings = question.answerSettings;
  const answerType = INPUTS_MENU.find(
    (option) => option.type === question.answerType
  );

  const handleRightAnswer = (rightAnswer: string) => {
    console.log("answer is", rightAnswer);
    editQuestion(
      {
        ...question,
        answerSettings: {
          ...answerSettings,
          validationRules: {
            ...answerSettings.validationRules,
            match: { answer: rightAnswer },
          },
        },
      },
      question.tempId
    );
  };
  const updateAnswerType: MenuProps["onClick"] = ({ key }) => {
    const selectedItem = INPUTS_MENU.find((item) => item.key === key);
    editQuestion(
      { ...question, answerType: selectedItem!.type, answerSettings: {} },
      question.tempId
    );
  };

  const updateIsRequired = (checked: boolean) => {
    editQuestion(
      { ...question, answerSettings: { ...answerSettings, required: checked } },
      question.tempId
    );
  };

  const handleAnswerSettings = (answerSettings: IAnswerSettings) => {
    editQuestion(
      {
        ...question,
        answerSettings: { ...question.answerSettings, ...answerSettings },
      },
      question.tempId
    );
  };

  return (
    <StyleWrapper>
      <Text className="question">
        Question {questionIndex + 1} of {questionsList.length}
      </Text>
      <Divider className="divider" />
      <div className="input-property">
        <Text className="property-title">Properties</Text>
        <div className="property-setting">
          <Text className="property-name">Type</Text>
          <Dropdown menu={{ items: INPUTS_MENU, onClick: updateAnswerType }}>
            <Text>
              {answerType?.label} <DownOutlined />
            </Text>
          </Dropdown>
        </div>
        <div className="property-setting">
          <Text className="property-name">Required</Text>
          <Switch
            checked={answerSettings.required}
            onChange={updateIsRequired}
          />
        </div>
      </div>
      <Divider className="divider" />
      <Validation
        key={question.tempId + "validation"}
        answerType={question.answerType}
        answerSettings={answerSettings}
        handleAnswerSettings={handleAnswerSettings}
      />
      <Divider className="divider" />
      <RightAnswer
        key={question.tempId + "rightAnswer"}
        answerType={question.answerType}
        answerSettings={answerSettings}
        onChange={handleRightAnswer}
      />
      <Divider className="divider" />
      <Button
        danger
        type="text"
        className="delete-button"
        onClick={() => deleteQuestion(question.tempId)}
      >
        <DeleteOutlined /> Delete
      </Button>
      <Divider className="divider" />
    </StyleWrapper>
  );
}

export default AnswerSettings;
