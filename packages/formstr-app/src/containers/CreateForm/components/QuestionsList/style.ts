import styled from "styled-components";
import { MEDIA_QUERY_MOBILE } from "../../../../utils/css";

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
      height: 50px;
      width: 53px;
      box-shadow: 0px 0px 5px 5px #dedede;
    }
  }
  .reorder-group {
    list-style: none;
    padding: 0;
  }
`;
