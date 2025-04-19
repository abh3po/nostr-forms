import { styled } from 'styled-components';

export const StyledContainer = styled.div`
  
  .prompt-input {
    margin-bottom: 16px;
  }
  
  .generation-options {
    margin-bottom: 16px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .loading-container {
    text-align: center;
    padding: 24px;
  }
  
  .response-preview {
    max-height: 200px;
    overflow-y: auto;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    margin-top: 16px;
    margin-bottom: 16px;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 12px;
  }
  
  .model-select-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  .reload-button {
    font-size: 14px;
    padding: 0;
    height: auto;
  }
`;