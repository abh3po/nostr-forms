import style from 'styled-components';

export default style.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 208px);
  align-items: center;
  justify-content: center;

  .empty-screen {
    height: 40%;
  }

  .no-data {
    text-align: center;
    font-size: 24px;
  }

  .add-form {
    align-self: center;
    width: 160px;
    margin: 8px;
  }
`;
