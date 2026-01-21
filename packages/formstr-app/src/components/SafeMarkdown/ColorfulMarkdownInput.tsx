import React from "react";
import { Input } from "antd";

type Props = {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  fontSize?: number;
  className?: string;
  disabled?: boolean;
};

export const ColorfulMarkdownTextarea: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  fontSize,
  className,
  disabled,
}) => {
  const [editableText, setEditableText] = React.useState<string>("");

  React.useEffect(() => {
    onChange(editableText);
  }, [editableText]);

  React.useEffect(() => {
    setEditableText(value || "");
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditableText(newText);
  };

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Text area */}
      <Input.TextArea
        value={value}
        style={{ fontSize: fontSize, color: "black" }}
        onChange={handleTextChange}
        placeholder={placeholder}
        disabled={disabled}
        autoSize
      />
    </div>
  );
};
