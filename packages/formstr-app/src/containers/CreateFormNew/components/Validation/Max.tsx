import { Typography } from "antd";
import { InputStyle } from "./validation.style";
import { MaxRule, ValidationRuleTypes } from "../../../../nostr/types";

const { Text } = Typography;

function Max({ rule, onChange }: { rule?: MaxRule; onChange: Function }) {
  return (
    <InputStyle>
      <Text className="property-name">Max length:</Text>
      <input
        className="number-input"
        type="number"
        value={rule?.max}
        onChange={(e) =>
          onChange(ValidationRuleTypes.max, { max: e.target.value })
        }
      />
    </InputStyle>
  );
}

export default Max;
