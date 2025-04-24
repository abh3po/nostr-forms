import styled from 'styled-components';

export default styled.div`
  .asterisk {
    transition: fill 0.2s ease-in-out;
    font-size: 12px;
    margin: 2.5px;
    height: 12px;
    width: 12px;
  }
  .asterisk:hover {
    fill: #ea8dea;
  }
  .asteriskSelected {
    fill: #ea8dea;
  }
  .action-wrapper {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
    padding-top: 5px;
  }

  .action-icon {
    cursor: pointer;
    height: 28px;
    width: 28px;
    background-color: rgb(0, 0, 0, 0.05);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
  }
  .icon-svg {
    font-size: 12px;
  }
`;
