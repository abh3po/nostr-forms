import { ValidationRuleTypes, MinRule } from "@formstr/sdk/dist/interfaces";
import { Typography } from "antd";
import { InputStyle } from "./validation.style";

const { Text } = Typography;

function Min({ rule, onChange }: { rule?: MinRule; onChange: Function }) {
  return (
    <InputStyle>
      <Text className="property-name">Min length:</Text>
      <input
        className="number-input"
        type="number"
        value={rule?.min}
        onChange={(e) =>
          onChange(ValidationRuleTypes.min, { min: e.target.value })
        }
      />
    </InputStyle>
  );
}

export default Min;
