import React from "react";
import { Form, Input, Row, Tooltip, InputRef } from "antd";
import { NumberConstraint } from "../../../../../nostr/types";

interface Constraints {
  max?: number;
  min?: number;
}

interface NumberConstraintsProps {
  onConstraintsChange: (constraints: Constraints | null) => void;
  numberConstraints: NumberConstraint;
}

export const NumberConstraints: React.FC<NumberConstraintsProps> = ({
  onConstraintsChange,
  numberConstraints,
}) => {
  const [error, showError] = React.useState(false);
  const maxRef = React.useRef<InputRef | null>();
  const minRef = React.useRef<InputRef | null>();
  const handleOnChange = () => {
    const maxValue = maxRef.current?.input?.value
      ? Number(maxRef.current?.input?.value)
      : undefined;
    const minValue = minRef.current?.input?.value
      ? Number(minRef.current?.input?.value)
      : undefined;
    if (
      maxValue !== undefined &&
      minValue !== undefined &&
      maxValue < minValue
    ) {
      showError(true);
      onConstraintsChange(null);
    } else {
      showError(false);
      onConstraintsChange({
        max: maxValue,
        min: minValue,
      });
    }
  };
  return (
    <Row justify={"space-between"}>
      <Tooltip open={error} title={"Max value should be more than min value"}>
        <Row>
          <Form.Item label={"Enter the minimum allowed number(optional)"}>
            <Input
              defaultValue={numberConstraints?.min}
              ref={(elem) => (minRef.current = elem)}
              type={"number"}
              onChange={() => {
                handleOnChange();
              }}
            />
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label={"Enter the maximum allowed number(optional)"}>
            <Input
              defaultValue={numberConstraints?.max}
              ref={(elem) => (maxRef.current = elem)}
              type={"number"}
              onChange={() => {
                handleOnChange();
              }}
            />
          </Form.Item>
        </Row>
      </Tooltip>
    </Row>
  );
};
