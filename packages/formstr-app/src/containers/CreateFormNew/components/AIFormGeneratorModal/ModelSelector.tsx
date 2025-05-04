import React from 'react';
import { Select, Typography, Spin, Empty, Space } from 'antd';
import { ModelSelectorProps } from './types'; 

const { Text } = Typography;
const { Option } = Select;
const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
  availableModels,
  fetchingModels,
  disabled, 
}) => {
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>Select Model</Text>
      </div>
      <Select
        style={{ width: '100%' }}
        value={model || undefined} 
        onChange={setModel} 
        loading={fetchingModels}
        disabled={disabled || fetchingModels} 
        placeholder={fetchingModels ? "Loading models..." : "Select a model"}
        notFoundContent={
            fetchingModels ? <Spin size="small" /> :
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={disabled ? "Connect to server first" : "No models found"} />
        }
        aria-label="Select Ollama Model"
      >
        {availableModels.map(m => (
          <Option key={m.name} value={m.name}>
            {m.name}
          </Option>
        ))}
      </Select>
      {availableModels.length === 0 && !fetchingModels && !disabled && (
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            No models detected on the server. Try refreshing or check the server configuration.
        </Text>
      )}
    </Space>
  );
};

export default ModelSelector;