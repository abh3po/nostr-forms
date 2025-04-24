import styled from 'styled-components';

import { MEDIA_QUERY_MOBILE } from '../../utils/css';
export default styled.div<{
  $isPreview?: boolean;
}>`
  .form-filler {
    background-color: #dedede;
    padding-left: 32px;
    padding-right: 32px;
    width: 60%;
    margin: 0 auto 0 auto;
    ${MEDIA_QUERY_MOBILE} {
      width: 100%;
      padding: 0;
    }
  }

  .filler-container {
    width: 100%;
    background-color: #dedede;
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;

    div:last-of-type {
      margin-top: auto;
    }
  }

  .branding-container {
    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 10px;
    ${MEDIA_QUERY_MOBILE} {
      flex-direction: column;
      align-items: center;
    }
  }

  .text-style {
    color: #a8a29e;
    font-size: 14;
  }

  .form-title {
    position: relative;
    height: 250px;
    background-color: #ff5733;
    border-radius: 10px;
    margin-top: 30px;
    overflow: hidden;
  }

  .filler-question {
    max-width: '100%';
    margin: '5px';
    text-align: 'left';
  }

  .form-description {
    text-align: left;
    padding: 1em;
  }

  .submit-button {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
  }

  .foss-link {
    text-decoration: none;
  }

  .with-description {
    margin-top: 1px;
  }

  .hidden-description {
    margin-top: 10px;
  }

  .embed-submitted {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .question-text {
    img {
      max-width: 40%;
      height: auto;
    }
    word-wrap: break-word;
    overflow: auto;
  }
`;
