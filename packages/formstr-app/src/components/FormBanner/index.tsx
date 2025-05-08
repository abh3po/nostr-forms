import { Typography } from "antd";
import StyleWrapper from "./style";
const { Text } = Typography;

function FormBanner({
  imageUrl,
  formTitle,
}: {
  imageUrl: string;
  formTitle: string;
}) {
  const settings = {
    name: formTitle,
    image: imageUrl,
  };

  return (
    <StyleWrapper className="form-title" $titleImageUrl={settings.image}>
      {<Text className="title-text">{settings.name}</Text>}
    </StyleWrapper>
  );
}

export default FormBanner;
