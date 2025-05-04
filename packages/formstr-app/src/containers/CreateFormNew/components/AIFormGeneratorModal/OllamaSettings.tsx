import React from 'react';
import { Input, Button, Space, Typography, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { OllamaSettingsProps } from './types';

const { Text } = Typography;

const OllamaSettings: React.FC<OllamaSettingsProps> = ({
  ollamaUrl,
  onUrlChange,
  onTestConnection,
  loading,
}) => {
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space align="center">
         <Text>Ollama Server URL</Text>
         <Tooltip title="The base URL of your running Ollama instance (e.g., http://localhost:11434). Connection will be tested automatically when you click away from this field.">
              <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', cursor: 'help' }} />
         </Tooltip>
      </Space>
      <Input
        placeholder="e.g., http://localhost:11434"
        value={ollamaUrl}
        onChange={onUrlChange}
        onBlur={onTestConnection}
        disabled={loading}
        aria-label="Ollama Server URL"
      />
    </Space>
  );
};

export default OllamaSettings;