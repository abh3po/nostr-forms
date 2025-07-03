import React from 'react';
import { Select, Spin, Empty } from 'antd';
import { ModelSelectorProps } from './types';

const { Option } = Select;

const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  setModel,
  availableModels,
  fetching,
  disabled,
  style,
  placeholder = "Select a model"
}) => {
  return (
    <Select
      style={style}
      value={model}
      onChange={setModel}
      loading={fetching}
      disabled={disabled || fetching}
      placeholder={fetching ? "Loading models..." : placeholder}
      notFoundContent={
        fetching ? <Spin size="small" /> :
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={disabled ? "Connect to use AI" : "No models found"} />
      }
      aria-label="Select Ollama Model"
    >
      {availableModels.map(m => (
        <Option key={m.name} value={m.name}>
          {m.name}
        </Option>
      ))}
    </Select>
  );
};

export default ModelSelector;