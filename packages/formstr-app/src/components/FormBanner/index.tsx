import { Typography } from "antd";
import StyleWrapper from "./style";
import SafeMarkdown from "../SafeMarkdown";
const { Text } = Typography;

function FormBanner({
  imageUrl,
  formTitle,
}: {
  imageUrl?: string;
  formTitle: string;
}) {
  const settings = {
    name: formTitle,
    image: imageUrl,
  };

  return (
    <StyleWrapper className="form-title" $titleImageUrl={settings.image}>
      <Text className="title-text"><SafeMarkdown>{settings.name}</SafeMarkdown></Text>
    </StyleWrapper>
  );
}

export default FormBanner;
