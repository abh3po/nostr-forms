import React from "react";
import { Input, Popover, Button } from "antd";
import { SketchPicker, ColorResult } from "react-color";
import useFormBuilderContext from "../../containers/CreateFormNew/hooks/useFormBuilderContext";

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

const SPAN_WRAPPER_REGEX = /^<span([^>]*)>\s*([\s\S]*?)\s*<\/span>$/i;

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const unescapeHtml = (str: string) =>
  str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

export const ColorfulMarkdownTextarea: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  fontSize,
  className,
  disabled,
}) => {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [color, setColor] = React.useState<string | null>(null);
  const [editableText, setEditableText] = React.useState<string>("");
  const { formSettings } = useFormBuilderContext();
  const [globalColor, setGlobalColor] = React.useState<string | null>(
    formSettings.globalColor ?? null
  );

  const isParsingRef = React.useRef(false);
  const prevGlobalColorRef = React.useRef(globalColor);

  React.useEffect(() => {
    setGlobalColor(formSettings.globalColor ?? null);
  }, [formSettings.globalColor]);

  const effectiveColor = color ?? globalColor ?? "#000000";

  React.useEffect(() => {
    isParsingRef.current = true;

    if (!value) {
      setEditableText("");
      isParsingRef.current = false;
      return;
    }

    const match = value.match(SPAN_WRAPPER_REGEX);
    if (match) {
      const [, attrs = "", inner] = match;
      const isGlobalColor =
        /\bdata-global-color\s*=\s*"(?:1|true)"/i.test(attrs) ||
        /\bdata-global-color\b/i.test(attrs);
      const colorMatch = attrs.match(/style="[^"]*color:\s*([^;"]+)/i);
      const extractedColor = colorMatch ? colorMatch[1].trim() : null;

      if (isGlobalColor) {
        setColor(null);
      } else if (extractedColor) {
        setColor(extractedColor);
      }
      setEditableText(unescapeHtml(inner ?? ""));
    } else {
      setEditableText(unescapeHtml(value));
    }

    setTimeout(() => {
      isParsingRef.current = false;
    }, 0);
  }, [value]);

  React.useEffect(() => {
    const globalColorChanged = prevGlobalColorRef.current !== globalColor;
    prevGlobalColorRef.current = globalColor;

    if (
      color === null &&
      editableText &&
      globalColorChanged &&
      !isParsingRef.current
    ) {
      const colorToUse = globalColor ?? "#000000";
      const newValue = `<span style="color:${colorToUse}" data-global-color="1">${escapeHtml(
        editableText
      )}</span>`;
      onChange(newValue);
    }
  }, [globalColor, color, editableText, onChange]);

  const handleColorChange = (c: ColorResult) => {
    setColor(c.hex);
    setPickerOpen(false);
    onChange(`<span style="color:${c.hex}">${escapeHtml(editableText)}</span>`);
  };

  const clearColor = () => {
    setColor(null);
    setPickerOpen(false);
    const colorToUse = globalColor ?? "#000000";
    onChange(
      `<span style="color:${colorToUse}" data-global-color="1">${escapeHtml(
        editableText
      )}</span>`
    );
  };

  const handleTextChange = (e: any) => {
    const newText = e.target.value;
    setEditableText(newText);
  };

  const handleBlur = () => {
    const colorToUse = effectiveColor;
    onChange(
      `<span style="color:${colorToUse}" ${
        color === null ? 'data-global-color="1"' : ""
      }>${escapeHtml(editableText)}</span>`
    );
  };

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Text area */}
      <Input.TextArea
        value={editableText}
        style={{ color: effectiveColor, fontSize: fontSize }}
        onChange={handleTextChange}
        placeholder={placeholder}
        disabled={disabled}
        onBlur={handleBlur}
        autoSize
      />

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
              <SketchPicker
                color={effectiveColor}
                onChange={handleColorChange}
              />
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
              background: effectiveColor,
              boxShadow:
                color === null
                  ? "0 0 0 1px #fff, 0 1px 3px rgba(0,0,0,.2), inset 0 0 0 2px rgba(255,255,255,0.3)"
                  : "0 0 0 1px #fff, 0 1px 3px rgba(0,0,0,.2)",
              cursor: "pointer",
            }}
          />
        </Popover>
      </div>
    </div>
  );
};
