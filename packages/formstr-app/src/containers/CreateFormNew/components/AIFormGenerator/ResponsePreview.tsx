import React from 'react';
import { Spin, Typography } from 'antd';
import { ResponsePreviewProps } from './types';

const { Text } = Typography;

const ResponsePreview: React.FC<ResponsePreviewProps> = ({
  loading,
  generationResponse,
  error
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <Spin tip="Generating form..." size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>
          This might take a moment depending on your model and hardware.
        </Text>
      </div>
    );
  }

  if (generationResponse) {
    return (
      <>
        <Text strong>Response Preview:</Text>
        <div className="response-preview">
          {generationResponse}
        </div>
      </>
    );
  }

  return null;
};

export default ResponsePreview;