import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";

interface IAnswerSettings {
  defaultValue?: string | number | Date;
}

interface DateTimeFillerProps {
  fieldConfig?: IAnswerSettings;
  onChange: (value: string) => void; // Unix timestamp (seconds) as string
  disabled?: boolean;
}

export const DateTimeFiller: React.FC<DateTimeFillerProps> = ({
  fieldConfig,
  onChange,
  disabled = false,
}) => {
  // Initialize date from default value if valid
  const defaultVal = fieldConfig?.defaultValue;
  const initialDate: Dayjs | null =
    defaultVal && dayjs(defaultVal).isValid() ? dayjs(defaultVal) : null;

  const [date, setDate] = useState<Dayjs | null>(initialDate);

  // Emit initial value on mount
  useEffect(() => {
    if (initialDate) {
      onChange(String(Math.floor(initialDate.valueOf() / 1000))); // seconds
    }
  }, [initialDate, onChange]);

  // Handle date (and time) change
  const handleChange = (newDate: Dayjs | null) => {
    setDate(newDate);
    if (newDate) {
      // Convert milliseconds → seconds
      onChange(String(Math.floor(newDate.valueOf() / 1000)));
    } else {
      onChange("");
    }
  };

  return (
    <div>
      <DatePicker
        value={date}
        onChange={handleChange}
        showTime
        style={{ marginBottom: 8, width: "100%" }}
        disabled={disabled}
        placeholder="Pick Date & Time"
      />
    </div>
  );
};
