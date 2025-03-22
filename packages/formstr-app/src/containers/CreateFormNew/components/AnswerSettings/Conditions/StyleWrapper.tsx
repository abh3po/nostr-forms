import styled from "styled-components";

const StyleWrapper = styled.div`
  .conditions {
    padding: 16px;
  }
  .property-title {
    margin-bottom: 16px;
    font-weight: 500;
  }
  .condition-rule {
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 16px;
  }
  .rule-item {
    margin-bottom: 12px;
    margin-top: 10px;
  }
  .rule-label {
    margin-top: 10px;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.65);
  }
  .condition-group {
    background: #f0f9ff;
    border: 1px solid #e6f7ff;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .nested-content {
    margin-left: 8px;
    padding-left: 16px;
    border-left: 2px solid #1890ff;
    position: relative;
  }
  
  /* Add connecting lines */
  .nested-rule {
    position: relative;
  }
  
  .nested-rule:before {
    content: "";
    position: absolute;
    top: 0;
    left: -16px;
    height: 100%;
    width: 2px;
    background: #1890ff;
  }
  
  .logic-selector {
    margin-top: 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: #fafafa;
    border-radius: 4px;
  }
  .logic-label {
    display: block;
    margin-bottom: 5px;
    color: rgba(0, 0, 0, 0.65);
    font-size: 13px;
  }
  .remove-button {
    margin-top: 12px;
  }
  
  /* New styles for rule sets and inter-group connections */
  .rule-set-card {
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.09);
    overflow: hidden;
  }
  
  .inter-group-connector {
    margin: 16px 0;
    position: relative;
  }
  
  .logic-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    background: #1890ff;
    color: white;
    font-weight: 500;
    border-radius: 16px;
    font-size: 14px;
  }
  
  .logic-badge.or {
    background: #ff4d4f;
  }
`;

export default StyleWrapper;