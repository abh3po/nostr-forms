import { TimePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";

dayjs.extend(customParseFormat);

interface TimeFillerProps {
  defaultValue?: string;
  onChange: (answer: string, message?: string) => void;
}

export const TimeFiller: React.FC<TimeFillerProps> = ({
  defaultValue,
  onChange,
}) => {
  const [value, setValue] = useState<dayjs.Dayjs | null>(
    defaultValue ? dayjs(defaultValue, "h:mm A") : null
  );

  useEffect(() => {
    if (value) {
      onChange(value.format("h:mm A"), "");
    }
  }, [value]);

  return (
    <>
      <TimePicker
      use12Hours
      format="h:mm A"
      value={value}
      onSelect={(val) => setValue(val)}
      allowClear={false}
    />
    </>
  );
};
