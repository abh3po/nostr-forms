import styled from 'styled-components';

import { MEDIA_QUERY_MOBILE } from '../../../../utils/css';

export default styled.div`
  .create-form-header {
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    opacity: 0.88;
    background: white;
    border-bottom: 1px solid rgb(221, 221, 221);
    ${MEDIA_QUERY_MOBILE} {
      padding-left: 15px;
      padding-right: 15px;
    }
  }
`;
