import styled from "styled-components";

export default styled.div`
  .form-details {
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    width: 100%;
  }

  .form-details-card {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }

  .settings-container {
    justify-content: center;
    width: 100%;
  }

  .settings-item {
    margin: 5px;
    padding: 5px;
  }

  .embedded-share {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    justify-content: center;
    width: 100%;
  }

  .embedded-code {
    width: 50%;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  .ant-checkbox {
    margin-bottom: 4px;
    overflow-wrap: normal;
  }

  .share-links {
    word-wrap: break-word;
    overflow-wrap: anywhere;
    justify-content: center;
    align-items: center;
    max-width: 100%;
  }

  .embed-container {
    padding: 10px;
    background: radial-gradient(
      rgba(199, 199, 199, 1) 0%,
      rgba(255, 255, 255, 1) 100%
    );
    margin-bottom: 10px;
    width: 60%;
    max-width: 100%;
  }
`;
