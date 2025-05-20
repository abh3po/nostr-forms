import { TimePicker, TimePickerProps } from "antd";
import dayjs from "dayjs";

interface TimeFillerProps {
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const TimeFiller: React.FC<TimeFillerProps> = ({
  onChange,
  defaultValue,
}) => {
  const handleChange: TimePickerProps["onChange"] = (_, timeString) => {
    if (Array.isArray(timeString)) {
      onChange(timeString[0]);
      return;
    }
    onChange(timeString);
  };
  return (
    <>
      <TimePicker onChange={handleChange} defaultValue={dayjs(defaultValue)} />
    </>
  );
};
