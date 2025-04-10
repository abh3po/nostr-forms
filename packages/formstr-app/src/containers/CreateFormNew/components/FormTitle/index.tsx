import { Input, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./style";
import { ChangeEvent, useEffect } from "react";

const { Text } = Typography;

function FormTitle({
  className,
  edit = true,
  imageUrl,
  formTitle,
  titleBackgroundType,
  titleBackgroundColor,
  titleTextSize,
  titleTextColor,
}: {
  className: string;
  edit?: boolean;
  imageUrl?: string;
  formTitle?: string;
  titleBackgroundType?: "image" | "color";
  titleBackgroundColor?: string;
  titleTextSize?: number;
  titleTextColor?: string;
}) {
  const { formSettings, formName, updateFormName, toggleSettingsWindow } =
    useFormBuilderContext();
  
  // Debug to track context changes
  useEffect(() => {
    console.log("FormTitle re-render with settings:", {
      type: formSettings.titleBackgroundType,
      color: formSettings.titleBackgroundColor,
      textSize: formSettings.titleTextSize,
      textColor: formSettings.titleTextColor
    });
  }, [formSettings]);

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormName(e.target.value);
  };

  // Use font size directly from settings
  const getFontSize = () => {
    const size = edit ? formSettings.titleTextSize : titleTextSize;
    return size ? `${size}px` : '24px'; // Default to 24px if not set
  };

  return (
    <StyleWrapper 
      className={className} 
      $titleImageUrl={edit ? formSettings.titleImageUrl : imageUrl}
      $titleBackgroundType={edit ? formSettings.titleBackgroundType : titleBackgroundType || "image"}
      $titleBackgroundColor={edit ? formSettings.titleBackgroundColor : titleBackgroundColor}
    >
      <div className="image-utils">
        {edit && (
          <>
            <div
              className="icon-util"
              title="Form settings"
              onClick={toggleSettingsWindow}
            >
              <SettingOutlined />
            </div>
          </>
        )}
      </div>
      {!edit && (
        <Text 
          className="title-text"
          style={{ 
            fontSize: getFontSize(),
            color: titleTextColor || "#ffffff"
          }}
        >
          {formTitle}
        </Text>
      )}
      {edit && (
        <Input.TextArea
          className="title-text"
          value={formName}
          onChange={handleTitleChange}
          autoSize={true}
          style={{ 
            fontSize: getFontSize(),
            color: formSettings.titleTextColor || "#ffffff"
          }}
        />
      )}
    </StyleWrapper>
  );
}

export default FormTitle;
