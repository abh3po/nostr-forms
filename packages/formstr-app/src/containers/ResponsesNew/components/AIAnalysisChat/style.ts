import styled from 'styled-components';

export const ChatWrapper = styled.div`
  width: 100%;
  margin-top: 8px;
  
  .ant-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  .ant-card-head {
    background-color: #fafafa;
  }
  
  .chat-footer-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-help-section {
    flex-grow: 1;
    position: relative;
  }

  .footer-help-section .ant-collapse-content {
    position: absolute;
    bottom: calc(100%); /* Position above the header */
    left: 0;
    right: 0;
    min-width: 400px;
    background-color: #ffffff;
    border: 1px solid #f0f0f0;
    z-index: 10;
    border-radius: 8px;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  }

  .ai-chat-button-success {
      background-color: #00796b;
      color: white;
      border-color: #00796b;
  }

  .ai-chat-button-success:hover {
      background-color: #004d40;
      color: white !important;
      border-color: #004d40 !important;
  }

  .ai-chat-button-danger {
      background-color: #d32f2f;
      color: white;
      border-color: #d32f2f;
  }

  .ai-chat-button-danger:hover {
      background-color: #c62828;
      color: white !important;
      border-color: #c62828 !important;
  }
`;

export const MessageList = styled.div`
  height: 300px;
  overflow-y: auto;
  margin-bottom: 0px;
  padding-right: 8px;
`;

export const MessageItem = styled.div<{ sender: 'user' | 'ai' }>`
  margin-bottom: 12px;
  display: flex;
  justify-content: ${props => (props.sender === 'user' ? 'flex-end' : 'flex-start')};

  .message-bubble {
    padding: 8px 12px;
    border-radius: 18px;
    max-width: 80%;
    background-color: ${props => (props.sender === 'user' ? '#FF5733' : '#f0f0f0')};
    color: ${props => (props.sender === 'user' ? 'white' : 'black')};
    word-wrap: break-word;
  }
`;