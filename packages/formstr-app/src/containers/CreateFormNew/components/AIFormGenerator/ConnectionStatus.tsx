import React from 'react';
import { Alert, Spin, Typography } from 'antd';
import { ConnectionStatusProps } from './types';

const { Text } = Typography;

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  loading,
  connectionStatus,
  availableModels,
  error
}) => {
  if (loading && connectionStatus === null) {
    return <Spin tip="Testing connection..." />;
  }

  if (connectionStatus !== null) {
    return (
      <>
        <Alert
          type={connectionStatus ? "success" : "error"}
          message={connectionStatus ?
            `Connected to Ollama with ${availableModels.length} model(s) available` :
            "Could not connect to Ollama"}
          showIcon
        />
        {!connectionStatus && error && error.includes('CORS') && (
          <Text type="danger" style={{ display: 'block', marginTop: '8px' }}>
            CORS error detected. If using an external server, ensure it allows cross-origin requests. 
            You may need to configure CORS on the server or use a proxy.
          </Text>
        )}
      </>
    );
  }

  return null;
};

export default ConnectionStatus;