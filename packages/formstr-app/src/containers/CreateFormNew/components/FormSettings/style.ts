import styled from "styled-components";

export default styled.div`
  background-color: white;
  overflow: auto;
  .divider {
    margin: 0;
  }

  .form-setting {
    margin: 16px;
  }

  .form-expiry {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-expiry .property-setting {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

  .property-setting {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
    font-size: 14px;
  }

  .sharing-settings {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 12px 0;
    font-size: 14px;
    min-width: 14px;
  }

  .file-input {
    border: 1px solid #dedede;
    border-radius: 10px;
    padding: 10px;
  }

  .warning-text {
    font-size: 12px;
    color: #ea8dea;
  }

  .warning-text a {
    color: #ea8dea;
    text-decoration: underline;
  }

  .file-input:focus {
    outline: none;
    border: 1px solid #dedede;
    box-shadow: 0 0 10px #f00;
    border-radius: 10px;
  }

  .npub-list {
    list-style: circle;
  }

  .npub-list-text {
    font-size: 12px;
    font-weight: normal;
  }

  .ant-collapse-header {
    padding: 0 !important;
  }

  .relay-text-container {
    width: 60%;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .relay-icons {
    padding-left: 10px;
  }

  .relay-item {
    display: flex;
    justify-content: space-between;
    margin: 5px;
  }

  .relay-edit-item {
    padding-right: 5px;
  }

  .add-relay-container {
    display: flex;
    justify-content: flex-end;
  }

  .ant-btn-icon-only {
    padding-top: 6px !important;
  }
`;
