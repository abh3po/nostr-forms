import React from 'react';
import { Typography, Space, Empty } from 'antd';
import { ModelSelectorProps } from './types'; 
import SharedModelSelector from '../../../../components/ModelSelector';

const { Text } = Typography;

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
      <SharedModelSelector
        model={model}
        setModel={setModel}
        availableModels={availableModels}
        fetching={fetchingModels}
        disabled={disabled}
        style={{ width: '100%' }}
        placeholder="Select a model"
      />
      {availableModels.length === 0 && !fetchingModels && !disabled && (
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            No models detected on the server. Try refreshing or check the server configuration.
        </Text>
      )}
    </Space>
  );
};

export default ModelSelector;