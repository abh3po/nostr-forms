// packages/formstr-app/src/containers/ResponsesNew/components/ResponseHeader.tsx
import React from 'react';
import { Button, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { Export } from '../Export';

interface ResponseHeaderProps {
  hasResponses: boolean;
  onAiAnalysisClick: () => void;
  responsesData: Array<{ [key: string]: string }>;
  formName: string;
}

export const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  hasResponses,
  onAiAnalysisClick,
  responsesData,
  formName,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '15px' }}>
      <Space>
        <Button
          icon={<RobotOutlined />}
          disabled={!hasResponses}
          onClick={onAiAnalysisClick}
        >
          AI Analysis
        </Button>
        <Export responsesData={responsesData} formName={formName} />
      </Space>
    </div>
  );
};