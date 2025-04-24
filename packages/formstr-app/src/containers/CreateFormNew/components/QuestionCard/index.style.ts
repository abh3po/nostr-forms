import styled from 'styled-components';

export default styled.div`
  .question-text {
    margin-bottom: 10px;
    line-height: 2;
    cursor: pointer;
  }

  .question-text:focus-visible {
    outline: none;
    border-bottom: 0.5px solid;
  }
  .question-card {
    max-width: 100%;
    margin: 10px;
    text-align: left;
  }
  .drag-icon {
    display: flex;
    justify-content: center;
    opacity: 0.5;
    cursor: pointer;
  }
  .ant-card-body {
    padding-top: 7px;
  }
`;
