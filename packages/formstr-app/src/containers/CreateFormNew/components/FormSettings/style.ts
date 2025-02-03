import styled from "styled-components";

export default styled.div`
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};

  .file-input {
    border: 1px solid ${props => props.theme.border};
  }

  .warning-text {
    color: #ea8dea;
  }

  .file-input:focus {
    border: 1px solid ${props => props.theme.border};
  }

  background-color: white;
  overflow: auto;
.divider {
   margin: 0;
   border-color: ${props => props.theme.border};
 }

 .form-setting {
   margin: 16px;
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
   border: 1px solid ${props => props.theme.border};
   border-radius: 10px;
   padding: 10px;
   background: ${props => props.theme.background};
   color: ${props => props.theme.text};
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
   border: 1px solid ${props => props.theme.border};
   box-shadow: 0 0 10px #f00;
   border-radius: 10px;
 }

 .npub-list {
   list-style: circle;
   color: ${props => props.theme.text};
 }

 .npub-list-text {
   font-size: 12px;
   font-weight: normal;
   color: ${props => props.theme.text};
 }

 .ant-collapse-header {
   padding: 0 !important;
   color: ${props => props.theme.text} !important;
 }

 .relay-text-container {
   width: 60%;
   text-overflow: ellipsis;
   overflow: hidden;
   color: ${props => props.theme.text};
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
   background: ${props => props.theme.background};
   color: ${props => props.theme.text};
   border-color: ${props => props.theme.border};
 }
`;
