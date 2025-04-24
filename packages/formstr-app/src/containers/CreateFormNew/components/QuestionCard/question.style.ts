import styled from 'styled-components';

export default styled.div`
  .ant-input {
    border: none;
    padding: 0;
  }

  .ant-input:focus {
    box-shadow: none;
    border-bottom: 1px solid black;
    border-radius: 0%;
  }

  .ant-input:focus::placeholder {
    color: lightgray;
  }
`;
