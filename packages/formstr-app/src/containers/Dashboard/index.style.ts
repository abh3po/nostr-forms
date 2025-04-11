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
    }
  }
`;