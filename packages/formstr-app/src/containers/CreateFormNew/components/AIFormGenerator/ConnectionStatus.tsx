import React from 'react';
import { Alert, Spin } from 'antd';
import { ConnectionStatusProps } from './types';

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  loading,
  connectionStatus,
  availableModels
}) => {
  if (loading && connectionStatus === null) {
    return <Spin tip="Testing connection..." />;
  }

  if (connectionStatus !== null) {
    return (
      <Alert
        type={connectionStatus ? "success" : "error"}
        message={connectionStatus ?
          `Connected to Ollama with ${availableModels.length} model(s) available` :
          "Could not connect to Ollama"}
        showIcon
      />
    );
  }

  return null;
};

export default ConnectionStatus;