import React from 'react';
import { Select, Button, Typography, Spin, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ModelSelectorProps } from './types';

const { Text } = Typography;
const { Option } = Select;

const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
  availableModels,
  fetchingModels,
  fetchModels
}) => {
  return (
    <div>
      <div className="model-select-header">
        <Text>Model</Text>
        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={fetchModels}
          loading={fetchingModels}
          className="reload-button"
        >
          Refresh
        </Button>
      </div>
      
      <Select
        style={{ width: '100%' }}
        value={model}
        onChange={setModel}
        loading={fetchingModels}
        notFoundContent={availableModels.length === 0 ?
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No models found" /> :
          <Spin size="small" />}
      >
        {availableModels.map(model => (
          <Option key={model.name} value={model.name}>{model.name}</Option>
        ))}
      </Select>
      
      {availableModels.length === 0 && !fetchingModels && (
        <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
          No models found. Connect to Ollama server to fetch available models.
        </Text>
      )}
    </div>
  );
};

export default ModelSelector;