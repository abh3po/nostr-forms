import React, { useState } from "react";
import { Input, Drawer, Button, Typography } from "antd";
import { BackgroundImagePicker } from "../../BackgroundImagePicker";
import { FileImageOutlined } from "@ant-design/icons";
import { sampleBackgrounds } from "../constants";
const { Text } = Typography;

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export const BackgroundImageSetting: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div style={{ marginTop: 16 }}>
      <Text className="property-name">Background Image</Text>
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
        <BackgroundImagePicker
          options={sampleBackgrounds}
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
