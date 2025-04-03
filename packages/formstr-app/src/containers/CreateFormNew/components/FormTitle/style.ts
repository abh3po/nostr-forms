import styled from "styled-components";

export default styled.div<{ $titleImageUrl?: string }>`
  ${({ $titleImageUrl }) => {
    return $titleImageUrl
      ? `
    background-image: linear-gradient(180deg, rgb(243 239 239 / 0%), rgb(4 3 3) 150%), url(${$titleImageUrl});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    `
      : `
    background-image: linear-gradient(180deg, rgb(243 239 239 / 0%), rgb(4 3 3) 150%);
    `;
  }}

  .title-text {
    color: white;
    position: absolute;
    bottom: 10px;
    left: 16px;
    font-size: 24px;
    max-width: 95%;
  }

  .image-utils {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
  }

  .icon-util {
    display: flex;
    justify-content: center;
    margin-left: 12px;
    width: 24px;
    height: 24px;
    background-color: lightgrey;
    box-shadow: 0px 0px 10px 0px #ea8dea;
    border-radius: 16px;
    opacity: 0.5;
    cursor: pointer;
  }

  .ant-input {
    border: none;
    padding: 0;
    background: transparent;
  }

  .ant-input:focus {
    box-shadow: none;
    border-bottom: 1px solid white;
    border-radius: 0%;
  }

  .ant-input:focus::placeholder {
    color: lightgray;
  }
`;
