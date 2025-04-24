import { V1Field } from '@formstr/sdk/dist/interfaces';
import { Card, Divider } from 'antd';
import Markdown from 'react-markdown';

import { AnswerTypes } from '../../../../constants';

import { InputFiller } from './InputFiller';

interface QuestionProps {
  field: V1Field;
  inputHandler: (questionId: string, answer: string, message?: string) => void;
  required: boolean;
}

export const QuestionNode: React.FC<QuestionProps> = ({ field, inputHandler, required }) => {
  const answerHandler = (questionId: string) => {
    return (answer: string, message?: string) => {
      return inputHandler(questionId, answer, message);
    };
  };

  return (
    <Card type="inner" className="filler-question">
      {required && <span style={{ color: '#ea8dea' }}>* &nbsp;</span>}
      <div className="question-text">
        <Markdown>{field.question}</Markdown>
      </div>
      {field.answerType === AnswerTypes.label ? null : <Divider />}
      <InputFiller
        answerType={field.answerType}
        answerSettings={field.answerSettings}
        onChange={answerHandler(field.questionId)}
      />
    </Card>
  );
};
