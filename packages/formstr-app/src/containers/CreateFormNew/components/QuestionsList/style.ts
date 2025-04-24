import styled from 'styled-components';

import { MEDIA_QUERY_MOBILE } from '../../../../utils/css';

export default styled.div`
  background-color: #dedede;
  padding-left: 32px;
  padding-right: 32px;
  overflow: scroll;
  height: calc(100dvh - 67px);
  width: calc(100vw - 482px);

  .form-title {
    position: relative;
    height: 250px;
    background-color: #ff5733;
    border-radius: 10px;
    margin-top: 30px;
    overflow: hidden;
  }

  .form-description {
    text-align: left;
    padding: 1em;
  }

  .mobile-add-btn {
    display: none;
    ${MEDIA_QUERY_MOBILE} {
      display: block;
      position: fixed;
      right: 10px;
      bottom: 80px;
      margin: 10px;
      z-index: 1000;

      > div {
        width: 53px;
        height: 50px;
        > div > button {
          width: 100%;
          height: 100%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }

  .reorder-group {
    list-style: none;
    padding: 0;
  }
`;
