import { getFormResponses } from '@formstr/sdk';
import { FormResponses, V1Field, V1FormSpec, V1Response } from '@formstr/sdk/dist/interfaces';
import { Card, Divider, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { isMobile } from '../../../utils/utility';

import { Export } from './Export';
import ResponseWrapper from './Responses.style';
import SummaryStyle from './summary.style';

const { Text } = Typography;

export const ResponsesOld = () => {
  const { formSecret } = useParams();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  const [allResponses, setAllResponses] = useState<FormResponses>({});
  const [questionMap, setQuestionMap] = useState<{ [key: string]: V1Field }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formSummary, setFormSummary] = useState<V1FormSpec>({
    name: 'Loading...',
    schemaVersion: 'v1',
  });

  useEffect(() => {
    async function fetchResponses() {
      if (!formSecret) {
        throw Error('form secret required to view responses');
      }
      const responses = await getFormResponses(formSecret || '', formId);
      setIsLoading(false);
      setAllResponses(responses.allResponses);
      setQuestionMap(responses.questionMap);
      setFormSummary(responses.formSummary);
    }
    fetchResponses();
  }, [formSecret, isLoading, formId]);

  const getData = () => {
    return Object.keys(allResponses).map((authorId) => {
      const authorName = allResponses[authorId].authorName;
      const authorResponses = allResponses[authorId].responses;
      const authorSubmissions = authorResponses.length;
      const lastAuthorResponse = authorResponses[authorSubmissions - 1];
      const createdAt = lastAuthorResponse.createdAt;
      const answerObject: { [key: string]: string } = {
        key: authorId,
        author: authorName,
        createdAt: createdAt,
      };
      lastAuthorResponse.response.forEach((response: V1Response) => {
        answerObject[response.questionId] = response.displayAnswer;
      });
      return answerObject;
    });
  };

  const getFlatColumns = () => {
    const columns: Array<{
      key: string;
      title: string;
      dataIndex: string;
      fixed?: 'left' | 'right';
      width?: number;
    }> = [
      {
        key: 'createdAt',
        title: 'Created At',
        dataIndex: 'createdAt',
        fixed: 'left',
        width: isMobile() ? 10 : 20,
      },
      {
        key: 'author',
        title: 'Author',
        dataIndex: 'author',
        width: isMobile() ? 10 : 20,
      },
    ];
    for (const [questionId, field] of Object.entries(questionMap)) {
      columns.push({
        key: questionId,
        title: field.question,
        dataIndex: questionId,
        width: 12,
      });
    }
    return columns;
  };

  return (
    <div>
      <SummaryStyle>
        <div className="summary-container">
          <Card>
            <Text className="heading">{formSummary.name}</Text>
            <Divider />
            <div className="response-count-container">
              <Text className="response-count">
                {isLoading ? 'Loading...' : Object.keys(allResponses).length}{' '}
              </Text>
              <Text className="response-count-label">response(s)</Text>
            </div>
          </Card>
        </div>
      </SummaryStyle>
      <ResponseWrapper>
        <Export questionMap={questionMap} answers={getData()} formName={formSummary.name} />

        <div style={{ overflow: 'scroll', marginBottom: 60 }}>
          <Table
            columns={getFlatColumns()}
            dataSource={getData()}
            pagination={false}
            loading={{
              spinning: isLoading,
              tip: '🔎 Looking for your responses...',
            }}
            scroll={{ x: isMobile() ? 900 : 1500, y: 'calc(65% - 400px)' }}
          />
        </div>
      </ResponseWrapper>
    </div>
  );
};
