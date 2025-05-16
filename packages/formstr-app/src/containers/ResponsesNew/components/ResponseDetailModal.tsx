import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Typography, Button, Space } from 'antd';
import { Event, nip19 } from 'nostr-tools';
import { Tag } from '../../../nostr/types';
import {getResponseLabels, DisplayableAnswerDetail} from '../../../utils/ResponseUtils';

const { Text } = Typography;

type ResponseDetailItem = {
  key: string; 
  question: string;
  answer: string;
};
interface ResponseDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  formSpec: Tag[];
  processedInputs: Tag[];
  responseMetadataEvent: Event | null; 
}
export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  isVisible,
  onClose,
  formSpec,
  processedInputs,
  responseMetadataEvent,
}) => {
  const [processedData, setProcessedData] = useState<ResponseDetailItem[]>([]);
  const [metaData, setMetaData] = useState<{ author?: string, timestamp?: string }>({});

  const processInputsForDisplay = (
    currentProcessedInputs: Tag[],
    currentFormSpec: Tag[],
  ): ResponseDetailItem[] => {
    if (!currentProcessedInputs || currentProcessedInputs.length === 0) {
      return [{ key: 'no-inputs-processed', question: 'Info', answer: 'No displayable response data available or decryption failed.' }];
    }
    const details: ResponseDetailItem[] = currentProcessedInputs.map((inputTag) => {
      const { questionLabel, responseLabel, fieldId } = getResponseLabels(inputTag, currentFormSpec);
      return { key: fieldId, question: questionLabel, answer: responseLabel };
    });
    return details;
  };

  useEffect(() => {
    if (isVisible && responseMetadataEvent && processedInputs) {
      const authorNpub = nip19.npubEncode(responseMetadataEvent.pubkey);
      const timestamp = new Date(responseMetadataEvent.created_at * 1000).toLocaleString();
      setMetaData({ author: authorNpub, timestamp });
      if (formSpec && formSpec.length > 0) {
        const data = processInputsForDisplay(processedInputs, formSpec);
        setProcessedData(data);
      } else {
        setProcessedData([{ key: 'loading-spec-modal', question: 'Status', answer: 'Waiting for form details...' }]);
      }
    } else {
      setProcessedData([]);
      setMetaData({});
    }
  }, [isVisible, responseMetadataEvent, processedInputs, formSpec]); 

  return (
    <Modal
      title={
        <Space direction="vertical" size="small">
          <Text strong>Response Details</Text>
          <Text type="secondary" style={{ fontSize: '0.9em' }}>
            By: <Typography.Link href={`https://njump.me/${metaData.author}`} target="_blank" rel="noopener noreferrer">{metaData.author || 'Unknown'}</Typography.Link>
          </Text>
          <Text type="secondary" style={{ fontSize: '0.8em' }}>
            Submitted: {metaData.timestamp || 'N/A'}
          </Text>
        </Space>
      }
      open={isVisible} 
      onCancel={onClose} 
      footer={[<Button key="close" onClick={onClose}>Close</Button>]} 
      width={600}
      destroyOnClose={true} 
    >
      <Descriptions bordered column={1} size="small">
        {processedData.map(item => (
          <Descriptions.Item key={item.key} label={item.question}>
            <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>
                {item.answer}
            </Typography.Text>
          </Descriptions.Item>
        ))}
        {processedData.length > 0 && (processedData[0]?.key?.startsWith('no-inputs') || processedData[0]?.key?.startsWith('loading-spec')) && (
          <Descriptions.Item key="info-state-modal" label={processedData[0].question}>
            {processedData[0].answer}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};