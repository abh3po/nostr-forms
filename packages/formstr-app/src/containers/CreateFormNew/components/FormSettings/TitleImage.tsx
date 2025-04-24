import { Typography } from 'antd';

import useFormBuilderContext from '../../hooks/useFormBuilderContext';

const { Text } = Typography;

function TitleImage({ titleImageUrl }: { titleImageUrl?: string }) {
  const { updateFormTitleImage } = useFormBuilderContext();

  return (
    <>
      <div className="property-setting">
        <Text className="property-name">Title image</Text>
      </div>
      <input
        className="file-input"
        type="text"
        value={titleImageUrl}
        onChange={updateFormTitleImage}
      />
    </>
  );
}

export default TitleImage;
