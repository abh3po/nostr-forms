import { Typography } from "antd";
import StyleWrapper from "./style";
import SafeMarkdown from "../SafeMarkdown";
const { Text } = Typography;

function FormBanner({
  imageUrl,
  formTitle,
  globalColor,
}: {
  imageUrl?: string;
  formTitle: string;
  globalColor?: string;
}) {
  const settings = {
    name: formTitle,
    image: imageUrl,
    globalColor,
  };

  return (
    <StyleWrapper className="form-title" $titleImageUrl={settings.image}>
      <Text
        className="title-text"
        style={{ color: settings.globalColor || "black" }}
      >
        <SafeMarkdown>{settings.name}</SafeMarkdown>
      </Text>
    </StyleWrapper>
  );
}

export default FormBanner;
