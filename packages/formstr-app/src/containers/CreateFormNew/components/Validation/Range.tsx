import { Typography } from "antd";
import { InputStyle } from "./validation.style";
import { RangeRule, ValidationRuleTypes } from "../../../../nostr/types";

const { Text } = Typography;

function Range({ rule, onChange }: { rule?: RangeRule; onChange: Function }) {
  return (
    <>
      <InputStyle>
        <Text className="property-name">Min num:</Text>
        <input
          className="number-input"
          type="number"
          value={rule?.min}
          onChange={(e) =>
            onChange(ValidationRuleTypes.range, {
              min: e.target.value,
              max: rule?.max,
            })
          }
        />
      </InputStyle>
      <InputStyle>
        <Text className="property-name">Max num:</Text>
        <input
          className="number-input"
          type="number"
          value={rule?.max}
          onChange={(e) =>
            onChange(ValidationRuleTypes.range, {
              min: rule?.min,
              max: e.target.value,
            })
          }
        />
      </InputStyle>
    </>
  );
}

export default Range;
