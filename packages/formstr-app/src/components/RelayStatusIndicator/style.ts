import styled from 'styled-components';
import { RelayStatus } from '../../containers/CreateFormNew/providers/FormBuilder/typeDefs'; // Adjust path as needed

interface StyledRelayStatusDotProps {
  status: RelayStatus;
}

const statusColors: Record<RelayStatus, string> = {
  connected: '#52c41a', // green
  pending: '#faad14',   // yellow
  error: '#f5222d',     // red
  unknown: '#d9d9d9',   // grey
};

const StyledRelayStatusDot = styled.span<StyledRelayStatusDotProps>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => statusColors[props.status] || statusColors.unknown};
  margin-right: 8px;
  vertical-align: middle;
`;

export default StyledRelayStatusDot;