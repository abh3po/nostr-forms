import { TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";

dayjs.extend(customParseFormat);

interface TimeFillerProps {
  defaultValue?: string;
  onChange: (answer: string, message?: string) => void;
  disabled?: boolean;
}

export const TimeFiller: React.FC<TimeFillerProps> = ({
  defaultValue,
  onChange,
  disabled = false,
}) => {
  const [value, setValue] = useState<dayjs.Dayjs | null>(
    defaultValue ? dayjs(defaultValue, "h:mm A") : null
  );

  useEffect(() => {
    setValue(defaultValue ? dayjs(defaultValue, "h:mm A") : null);
  }, [defaultValue]);

  useEffect(() => {
    if (value) {
      onChange(value.format("h:mm A"), "");
    }
  }, [value, onChange]);

  return (
    <>
      <TimePicker
      use12Hours
      format="h:mm A"
      value={value}
      onSelect={(val) => setValue(val)}
      allowClear={false}
      disabled={disabled}
    />
    </>
  );
};
