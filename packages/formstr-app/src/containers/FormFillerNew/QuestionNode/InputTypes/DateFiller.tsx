import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";

interface DateFillerProps {
  onChange: (value: string) => void;
  defaultValue?: string;
  testId? : string;
}

export const DateFiller: React.FC<DateFillerProps> = ({
  onChange,
  defaultValue,
  testId = "date-filler",
}) => {
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    onChange(dateString);
  };
  return (
    <>
      <DatePicker
        onChange={handleChange}
        defaultValue={defaultValue ? dayjs(defaultValue) : undefined}
        data-testid={`${testId}:picker`}
      />
    </>
  );
};
