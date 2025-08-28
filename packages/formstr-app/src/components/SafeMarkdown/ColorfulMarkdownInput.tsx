import React from "react";
import { Input, Popover, Button } from "antd";
import { SketchPicker, ColorResult } from "react-color";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import SafeMarkdown from ".";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
};

const SPAN_WRAPPER_REGEX =
  /^<span style="color:\s*[^"]+">\s*([\s\S]*?)\s*<\/span>$/i;

export const ColorfulMarkdownTextarea: React.FC<Props> = ({
  value = "",
  onChange,
  placeholder,
  minRows = 3,
  maxRows = 12,
}) => {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [color, setColor] = React.useState("#000000");
  const [preview, setPreview] = React.useState(false);

  React.useEffect(() => {
    const m = value?.match(/^<span style="color:\s*([^";]+)[";]?\s*">/i);
    if (m && m[1]) setColor(m[1]);
  }, [value]);

  const applyColor = (hex: string) => {
    let updated: string;
    if (SPAN_WRAPPER_REGEX.test(value)) {
      updated = value.replace(
        /^<span style="color:\s*[^"]+">/,
        `<span style="color:${hex}">`
      );
    } else {
      updated = `<span style="color:${hex}">${value}</span>`;
    }
    onChange(updated);
    setColor(hex);
  };

  const clearColor = () => {
    if (SPAN_WRAPPER_REGEX.test(value)) {
      const plain = value.replace(SPAN_WRAPPER_REGEX, "$1");
      onChange(plain);
    }
    setPickerOpen(false);
  };

  const handleColorChange = (c: ColorResult) => applyColor(c.hex);
  console.log("preview is? ", preview);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Content area */}
      {preview ? (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 14,
          }}
        >
          <SafeMarkdown>{value}</SafeMarkdown>
        </div>
      ) : (
        <Input.TextArea
          value={value}
          style={{color: color}}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoSize
        />
      )}

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 0,
        }}
      >
        {/* Color orb */}
        <Popover
          open={pickerOpen}
          onOpenChange={(open) => setPickerOpen(open)}
          content={
            <div style={{ padding: 4 }}>
              <SketchPicker color={color} onChange={handleColorChange} />
              <div style={{ marginTop: 8, textAlign: "right" }}>
                <Button size="small" onClick={clearColor}>
                  Clear
                </Button>
              </div>
            </div>
          }
          placement="topLeft"
          overlayStyle={{ padding: 0 }}
          destroyTooltipOnHide
        >
          <div
            role="button"
            aria-label="Open color picker"
            style={{
              width: 18, // 👈 smaller orb
              height: 18,
              borderRadius: "50%",
              background: color,
              boxShadow: "0 0 0 1px #fff, 0 1px 3px rgba(0,0,0,.2)",
              cursor: "pointer",
            }}
          />
        </Popover>

        {/* Preview toggle button */}
        {preview ? (
          <EditOutlined
            style={{ color: color }}
            color={color}
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevents Popover or parent from re-firing
              setPreview(false); // ✅ safe toggle
            }}
          />
        ) : (
          <EyeOutlined
            style={{ color: color }}
            color={color}
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevents Popover or parent from re-firing
              setPreview(true); // ✅ safe toggle
            }}
          />
        )}
      </div>
    </div>
  );
};
