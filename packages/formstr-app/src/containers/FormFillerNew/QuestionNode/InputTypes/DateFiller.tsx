import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";

interface DateFillerProps {
  onChange: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export const DateFiller: React.FC<DateFillerProps> = ({
  onChange,
  defaultValue,
  disabled = false,
}) => {
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    onChange(dateString);
  };
  return (
    <>
      <DatePicker
        onChange={handleChange}
        value={defaultValue ? dayjs(defaultValue) : undefined}
        disabled={disabled}
      />
    </>
  );
};
