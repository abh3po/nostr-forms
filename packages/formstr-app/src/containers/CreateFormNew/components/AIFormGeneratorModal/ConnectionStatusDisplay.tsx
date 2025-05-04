import React from 'react';
import { Alert, Spin, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { ConnectionStatusDisplayProps } from './types'; 

const { Text } = Typography;
const ConnectionStatusDisplay: React.FC<ConnectionStatusDisplayProps> = ({
  loading,
  connectionStatus,
  error,
  modelCount,
}) => {
  if (loading) {
    return (
      <Alert
        message="Connecting / Fetching Models..."
        description="Attempting to connect to the Ollama server and retrieve available models."
        type="info"
        showIcon
        icon={<Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />}
        style={{ marginBottom: '16px' }} 
      />
    );
  }
  if (connectionStatus === false || (connectionStatus === true && error && modelCount === 0)) { 
    let errorMessage = error || "Failed to connect or fetch models.";
    
    if (error?.toLowerCase().includes('network error') || error?.toLowerCase().includes('failed to fetch')) {
        errorMessage += " Check server URL and ensure CORS is configured if using a remote server.";
    }
    return (
        <Alert
            message="Connection Error"
            description={errorMessage}
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ marginBottom: '16px' }}
        />
    );
}
  if (connectionStatus === true) {
      const descriptionText = modelCount > 0
          ? `Successfully connected. Found ${modelCount} model(s). Ready to generate.`
          : `Successfully connected, but no models were found on the server. Cannot generate.`;
      const alertType = modelCount > 0 ? "success" : "warning";
      return (
        <Alert
            message={modelCount > 0 ? "Connection Successful" : "Connected (No Models)"}
            description={descriptionText}
            type={alertType}
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '16px' }}
        />
      );
  }
  return null;
};

export default ConnectionStatusDisplay;