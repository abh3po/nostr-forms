import React, { useState } from "react";
import { Input, Drawer, Button, Typography } from "antd";
import { ImagePicker } from "../../BackgroundImagePicker";
import { sampleThankYouScreens } from "../constants";
const { Text } = Typography;

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export const ThankYouScreenImageSetting: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ marginTop: 16 }}>
      <Text className="property-name">ThankYou Screen Image</Text>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Enter custom image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button onClick={() => setDrawerOpen(true)}>...</Button>
      </div>

      <Drawer
        title="Choose a Background"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={500}
      >
        <ImagePicker
          options={sampleThankYouScreens}
          selectedUrl={value}
          onSelect={(url) => {
            onChange(url);
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
};
