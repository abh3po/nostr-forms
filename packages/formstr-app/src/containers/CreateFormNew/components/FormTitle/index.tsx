import { Input, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./style";
import { ChangeEvent } from "react";

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

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateFormName(e.target.value);
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
        <Input.TextArea
          className="title-text"
          value={settings.name}
          onChange={handleTitleChange}
          autoSize={true}
        />
      )}
    </StyleWrapper>
  );
}

export default FormTitle;
