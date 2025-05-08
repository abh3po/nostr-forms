import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Typography, Button, Space } from 'antd';
import { Event, nip19, nip44 } from 'nostr-tools';
import { Tag, Field } from '../../../nostr/types'; 

const { Text } = Typography;

type ResponseDetailItem = {
  key: string; 
  question: string;
  answer: string;
};
interface ResponseDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  event: Event | null; 
  formSpec: Tag[] | null | undefined; 
  editKey: string | undefined | null; 
}
export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  isVisible,
  onClose,
  event,
  formSpec,
  editKey,
}) => {
  const [processedData, setProcessedData] = useState<ResponseDetailItem[]>([]);
  const [metaData, setMetaData] = useState<{ author?: string, timestamp?: string }>({});

  useEffect(() => {
    if (isVisible && event) {
      const authorNpub = nip19.npubEncode(event.pubkey);
      const timestamp = new Date(event.created_at * 1000).toLocaleString();
      setMetaData({ author: authorNpub, timestamp });
      setProcessedData([{ key: 'loading', question: 'Processing...', answer: '...' }]); 
    } else {
      setProcessedData([]);
      setMetaData({});
    }
  }, [isVisible, event, formSpec, editKey]); 
  const getInputs = (responseEvent: Event): Tag[] => {
     if (responseEvent.content === "") {
       return responseEvent.tags.filter((tag): tag is Tag => Array.isArray(tag) && tag[0] === "response");
     } else if (editKey) {
       try {
         let conversationKey = nip44.v2.utils.getConversationKey(
           editKey,
           responseEvent.pubkey
         );
         let decryptedContent = nip44.v2.decrypt(
           responseEvent.content,
           conversationKey
         );
         const parsed = JSON.parse(decryptedContent);
         if(Array.isArray(parsed)) {
             return parsed.filter(
               (tag: Tag): tag is Tag => Array.isArray(tag) && tag[0] === "response"
             );
         }
         console.warn("Decrypted content is not an array:", parsed);
         return [];
       } catch (e) {
           console.error("Failed to parse decrypted response content in modal:", e);
           return [];
       }
     } else {
       console.warn("Cannot decrypt response in modal: EditKey not available.");
       return [];
     }
   };

  const processEventForDisplay = (
    responseEvent: Event,
    spec: Tag[] | null | undefined,
    key: string | undefined | null
  ): ResponseDetailItem[] => {
    if (!spec) {
         if (responseEvent.content !== "" && !key) return [{ key: 'error-no-spec-no-key', question: 'Error', answer: 'Cannot display details. Form specification is encrypted, and the required key is missing.' }];
         return [{ key: 'error-no-spec', question: 'Error', answer: 'Could not load form specification to display question labels.' }];
    }
    const inputs = getInputs(responseEvent); 
    if (inputs.length === 0) {
         if (responseEvent.content !== "" && !key) return [{ key: 'error-decrypt', question: 'Access Denied', answer: 'Cannot decrypt response content without the correct key.' }];
         return [{ key: 'no-inputs', question: 'Info', answer: 'No response data found in this event.' }];
    }
    const details: ResponseDetailItem[] = inputs.map((inputTag) => {
      const [_resPlaceholder, fieldId, answerValue, metadataString] = inputTag;
      const questionField = spec.find(
        (tag): tag is Field => tag[0] === "field" && tag[1] === fieldId
      );
      let questionLabel = `Question ID: ${fieldId}`;
      let displayAnswer = answerValue ?? "N/A";
      if (questionField) {
        questionLabel = questionField[3] || questionLabel;
        if (questionField[2] === "option" && answerValue) {
           try {
               const choices = JSON.parse(questionField[4] || "[]") as Tag[];
               const selectedChoiceIds = answerValue.split(';');
               const choiceLabels = choices
                   .filter(choice => selectedChoiceIds.includes(choice[0]))
                   .map(choice => choice[1]);
               if (choiceLabels.length > 0) {
                   displayAnswer = choiceLabels.join(', ');
               }
               try {
                   const metadata = JSON.parse(metadataString || "{}");
                   if (metadata.message) {
                       const otherChoice = choices.find(c => { try { return JSON.parse(c[2] || '{}')?.isOther === true; } catch { return false; } });
                       if(otherChoice && selectedChoiceIds.includes(otherChoice[0])){
                           displayAnswer += ` (${metadata.message})`;
                       }
                   }
               } catch {}
           } catch (e) {}
        }
      }
      return { key: fieldId, question: questionLabel, answer: displayAnswer };
    });
    return details;
  };

   useEffect(() => {
    if (isVisible && event) {
      const authorNpub = nip19.npubEncode(event.pubkey);
      const timestamp = new Date(event.created_at * 1000).toLocaleString();
      setMetaData({ author: authorNpub, timestamp });
      const data = processEventForDisplay(event, formSpec, editKey);
      setProcessedData(data);
    } else {
      setProcessedData([]);
      setMetaData({});
    }
  }, [isVisible, event, formSpec, editKey]); 

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
        {processedData.length > 0 && processedData[0]?.key?.startsWith('error-') && (
            <Descriptions.Item key="error-info" label="Error">
                {processedData[0].answer}
            </Descriptions.Item>
       )}
       {processedData.length > 0 && processedData[0]?.key === 'no-inputs' && (
            <Descriptions.Item key="no-data-info" label="Info">
                {processedData[0].answer}
            </Descriptions.Item>
       )}
       {processedData.length === 0 && isVisible && event && ( 
            <Descriptions.Item key="loading-state" label="Status">
                Loading details...
            </Descriptions.Item>
       )}
      </Descriptions>
    </Modal>
  );
};