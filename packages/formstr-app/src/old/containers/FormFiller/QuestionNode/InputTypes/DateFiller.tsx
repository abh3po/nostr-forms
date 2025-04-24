import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';

interface DateFillerProps {
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const DateFiller: React.FC<DateFillerProps> = ({ onChange, defaultValue }) => {
  const handleChange: DatePickerProps['onChange'] = (date, dateString) => {
    onChange(dateString);
  };
  return (
    <>
      <DatePicker
        onChange={handleChange}
        defaultValue={defaultValue ? dayjs(defaultValue) : undefined}
      />
    </>
  );
};
