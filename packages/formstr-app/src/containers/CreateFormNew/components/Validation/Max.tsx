import { ValidationRuleTypes, MaxRule } from '@formstr/sdk/dist/interfaces';
import { Typography } from 'antd';

import { InputStyle } from './validation.style';

const { Text } = Typography;

function Max({ rule, onChange }: { rule?: MaxRule; onChange: Function }) {
  return (
    <InputStyle>
      <Text className="property-name">Max length:</Text>
      <input
        className="number-input"
        type="number"
        value={rule?.max}
        onChange={(e) => onChange(ValidationRuleTypes.max, { max: e.target.value })}
      />
    </InputStyle>
  );
}

export default Max;
