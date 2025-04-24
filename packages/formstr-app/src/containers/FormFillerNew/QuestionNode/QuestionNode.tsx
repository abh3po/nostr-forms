import { Option } from '@formstr/sdk/dist/formstr/nip101';
import { Card, Divider } from 'antd';
import Markdown from 'react-markdown';

import { AnswerTypes } from '../../../constants';

import { InputFiller } from './InputFiller';

interface QuestionProps {
  label: string;
  fieldConfig: any;
  fieldId: string;
  options: Option[];
  inputHandler: (questionId: string, answer: string, message?: string) => void;
  required: boolean;
}

export const QuestionNode: React.FC<QuestionProps> = ({
  label,
  fieldConfig,
  fieldId,
  options,
  inputHandler,
  required,
}) => {
  const answerHandler = (questionId: string) => {
    return (answer: string, message?: string) => {
      return inputHandler(questionId, answer, message);
    };
  };

  return (
    <Card type="inner" className="filler-question">
      {required && <span style={{ color: '#ea8dea' }}>* &nbsp;</span>}
      <div className="question-text">
        <Markdown>{label}</Markdown>
      </div>
      {fieldConfig.renderElement === AnswerTypes.label ? null : <Divider />}
      <InputFiller fieldConfig={fieldConfig} options={options} onChange={answerHandler(fieldId)} />
    </Card>
  );
};
