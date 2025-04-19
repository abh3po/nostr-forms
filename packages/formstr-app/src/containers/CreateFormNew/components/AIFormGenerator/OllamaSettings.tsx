import React from 'react';
import { Input, Button, Space, Typography} from 'antd';
import { OllamaSettingsProps } from './types';

const { Text } = Typography;

const OllamaSettings: React.FC<OllamaSettingsProps> = ({
  ollamaUrl,
  onUrlChange,
  onTestConnection,
  onSaveSettings,
  loading,
  connectionStatus
}) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text>Ollama Server URL</Text>
        <Input
          placeholder="http://localhost:11434"
          value={ollamaUrl}
          onChange={onUrlChange}
        />
      </div>

      <div className="action-buttons">
        <Button 
          onClick={onTestConnection} 
          loading={loading && connectionStatus === null}
        >
          Test Connection
        </Button>
        <Button type="primary" onClick={onSaveSettings}>
          Save Settings
        </Button>
      </div>
    </Space>
  );
};

export default OllamaSettings;