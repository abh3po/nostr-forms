import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { createZapRequest } from '../../utils/zapUtils';
import styled from 'styled-components';

const ZapAmountButton = styled(Button)<{ $selected?: boolean }>`
  margin: 5px;
  background-color: ${props => props.$selected ? '#f0f0f0' : 'white'};
  border: ${props => props.$selected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
`;

const ZapButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 15px;
`;

const ZapOptionsContainer = styled.div`
  padding: 16px 0;
`;

interface ZapModalProps {
  visible: boolean;
  onCancel: () => void;
  recipientPubkey: string;
  lud16: string;
  responseId: string;
  formId: string;
  recipientName?: string;
  relays: string[];
}

export const ZapModal: React.FC<ZapModalProps> = ({
  visible,
  onCancel,
  recipientPubkey,
  lud16,
  responseId,
  formId,
  recipientName,
  relays
}) => {
  const [amount, setAmount] = useState<number>(21);
  const [comment, setComment] = useState<string>('');
  const [isZapping, setIsZapping] = useState<boolean>(false);

  const zapOptions = [
    { emoji: '👍', amount: 21 },
    { emoji: '🚀', amount: 420 },
    { emoji: '☕', amount: 1000 },
    { emoji: '⚡', amount: 5000 },
    { emoji: '❤️', amount: 10000 },
    { emoji: '🔥', amount: 15000 },
  ];

  const handleZap = async () => {
    if (amount <= 0) {
      message.error('Please enter a valid amount');
      return;
    }

    setIsZapping(true);
    
    try {
      const lightningUrl = await createZapRequest(
        recipientPubkey,
        lud16,
        responseId,
        formId,
        amount,
        comment,
        relays
      );

      if (lightningUrl) {
        console.log("Opening lightning URL:", lightningUrl);
        const paymentRequest = lightningUrl.replace('lightning:', '');

        if (typeof window !== 'undefined' && (window as any).webln) {
          try {
            await (window as any).webln.enable();
            await (window as any).webln.sendPayment(paymentRequest);
            message.success("Zap sent successfully!");
          } catch (err) {
            console.error("WebLN payment failed:", err);
            // Try to open with the lightning handler instead
            window.location.href = lightningUrl;
          }
        } else {
          // Fallback to direct lightning URL
          window.location.href = lightningUrl;
        }
      } else {
        message.error("Failed to create zap request");
      }
    } catch (error) {
      message.error("Error processing zap");
    } finally {
      setIsZapping(false);
      onCancel();
    }
  };

  return (
    <Modal
      title={`Zap ${recipientName || 'User'}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="zap"
          type="primary"
          onClick={handleZap}
          loading={isZapping}
          style={{ backgroundColor: '#d63384' }}
        >
          Zap {amount} sats
        </Button>
      ]}
    >
      <ZapOptionsContainer>
        <ZapButtonRow>
          {zapOptions.map(option => (
            <ZapAmountButton
              key={option.amount}
              $selected={amount === option.amount}
              onClick={() => setAmount(option.amount)}
            >
              {option.emoji} {option.amount}
            </ZapAmountButton>
          ))}
        </ZapButtonRow>
        
        <div>
          <label>Custom amount:</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(parseInt(e.target.value) || 0)}
            min={1}
            style={{ marginTop: 5, marginBottom: 15 }}
          />
        </div>

        <div>
          <label>Message:</label>
          <Input.TextArea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="thank you 👍"
            rows={2}
            style={{ marginTop: 5 }}
          />
        </div>
      </ZapOptionsContainer>
    </Modal>
  );
};