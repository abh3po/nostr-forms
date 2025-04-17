import styled from "styled-components";

export default styled.div`
  .form-cards-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dashboard-container {
    margin-left: 10%;
    margin-right: 10%;
  }

  .form-card {
    min-width: 400px;
    width: 80%;
    margin: 10px;
  }

  .filter-dropdown-container {
    margin: 10px auto;
    width: 80%;
    display: flex;

    .ant-dropdown-trigger {
       width: 100%;
    }

    .ant-btn {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
      border: none;
      box-shadow: none;
      color: inherit;

  &:hover,
  &:focus,
  &:active {
    background: rgba(0, 0, 0, 0.08);
    color: inherit;
    border: none;
    box-shadow: none;
  }
    }
    .anticon-down {
      position: relative;
      top: -2px;
      font-size: 12px;
    }
  }
`;