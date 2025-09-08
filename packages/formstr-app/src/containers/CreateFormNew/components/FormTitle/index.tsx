import { Input, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./style";
import { ChangeEvent } from "react";
import { ColorfulMarkdownTextarea } from "../../../../components/SafeMarkdown/ColorfulMarkdownInput";

const { Text } = Typography;

function FormTitle({
  className,
  edit = true,
  imageUrl,
  formTitle,
}: {
  className: string;
  edit?: boolean;
  imageUrl?: string;
  formTitle?: string;
}) {
  const { formSettings, formName, updateFormName, toggleSettingsWindow } =
    useFormBuilderContext();

  const settings = {
    name: edit ? formName : formTitle,
    image: edit ? formSettings.titleImageUrl : imageUrl,
  };

  const handleTitleChange = (name: string) => {
    updateFormName(name);
  };

  return (
    <StyleWrapper className={className} $titleImageUrl={settings.image}>
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
      {!edit && <Text className="title-text">{settings.name}</Text>}
      {edit && (
        <ColorfulMarkdownTextarea
          className="title-text"
          value={formName || ""}
          onChange={handleTitleChange}
          fontSize={24}
        />
      )}
    </StyleWrapper>
  );
}

export default FormTitle;
