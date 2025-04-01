import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #212529;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 0 8px;
  
  &:hover {
    color: #212529;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Message = styled.div<{ isUser: boolean }>`
  margin-bottom: 12px;
  display: flex;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  background: ${props => props.isUser ? '#007bff' : '#f8f9fa'};
  color: ${props => props.isUser ? 'white' : '#212529'};
`;

const ChatInput = styled.div`
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

interface ChatInterfaceProps {
  onFormGenerated: (formData: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onFormGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      console.log('Sending request to Ollama with message:', userMessage);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'codellama',
          prompt: `You are a form generator. Generate a form based on this description: "${userMessage}"

IMPORTANT: You must return ONLY a valid JSON object with the following structure, no other text:
{
  "title": "Form Title",
  "fields": [
    {
      "type": "text|number|email|etc",
      "label": "Field Label",
      "required": boolean,
      "placeholder": "Optional placeholder"
    }
  ]
}

Do not include any explanatory text or markdown formatting. Return only the JSON object.`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw response from Ollama:', data);
      
      // Clean up the response by removing newlines and extra spaces
      const cleanResponse = data.response.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
      console.log('Cleaned response:', cleanResponse);
      
      try {
        const formData = JSON.parse(cleanResponse);
        console.log('Successfully parsed form data:', formData);
        
        // Validate the form data structure
        if (!formData.title || !Array.isArray(formData.fields)) {
          throw new Error('Invalid form data structure');
        }

        setMessages(prev => [...prev, { 
          text: "I've generated a form based on your description. The form has been added to your form builder.", 
          isUser: false 
        }]);
        
        onFormGenerated(formData);
      } catch (parseError) {
        console.error('Error parsing form data:', parseError);
        console.error('Failed to parse response:', cleanResponse);
        setMessages(prev => [...prev, { 
          text: "I generated a response but couldn't parse it properly. Please try again with a different description.", 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error generating form:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error while generating the form. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 24px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
        }}
      >
        Generate Form with AI
      </button>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>AI Form Generator</ChatTitle>
        <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
      </ChatHeader>
      <ChatMessages>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.isUser}>
            <MessageBubble isUser={message.isUser}>
              {message.text}
            </MessageBubble>
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </ChatMessages>
      <ChatInput>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the form you want to create..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Send'}
        </SendButton>
      </ChatInput>
    </ChatContainer>
  );
};

export default ChatInterface; 