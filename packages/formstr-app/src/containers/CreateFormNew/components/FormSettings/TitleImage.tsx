import { Typography, Switch, Collapse, Input, ColorPicker, InputNumber } from "antd";
import { useEffect, useState } from "react";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Panel } = Collapse;

type BackgroundType = "image" | "color";

function TitleImage({ titleImageUrl, titleBackgroundColor }: { 
  titleImageUrl?: string;
  titleBackgroundColor?: string;
}) {
  const { formSettings, updateFormTitleImage, updateFormSetting } = useFormBuilderContext();
  
  // Local state for immediate UI updates
  const [localBackgroundType, setLocalBackgroundType] = useState<BackgroundType>(
    formSettings.titleBackgroundType || "image"
  );
  const [localColor, setLocalColor] = useState(
    formSettings.titleBackgroundColor || "#f17124"
  );
  const [titleTextSize, setTitleTextSize] = useState<number>(
    formSettings.titleTextSize ? 
      typeof formSettings.titleTextSize === 'number' ? 
        formSettings.titleTextSize : 24
      : 24
  );
  const [titleTextColor, setTitleTextColor] = useState(
    formSettings.titleTextColor || "#ffffff"
  );
  const [titleTextXOffset, setTitleTextXOffset] = useState<number>(
    formSettings.titleTextXOffset !== undefined ? formSettings.titleTextXOffset : 16
  );
  const [titleTextYOffset, setTitleTextYOffset] = useState<number>(
    formSettings.titleTextYOffset !== undefined ? formSettings.titleTextYOffset : 10
  );
  const [showBanner, setShowBanner] = useState<boolean>(
    formSettings.showBanner !== false // Default to true unless explicitly set to false
  );
  
  // Apply default settings if none exist
  useEffect(() => {
    // If no background type is set, default to image
    if (!formSettings.titleBackgroundType) {
      updateFormSetting({
        titleBackgroundType: "image"
      });
    }
    
    // If image type but no image URL, set default image
    if ((!formSettings.titleImageUrl || formSettings.titleImageUrl === "") && 
        (formSettings.titleBackgroundType === "image" || !formSettings.titleBackgroundType)) {
      updateFormSetting({
        titleBackgroundType: "image",
        titleImageUrl: "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg"
      });
    }

    // Initialize positioning and visibility if not set
    if (formSettings.titleTextXOffset === undefined ||
        formSettings.titleTextYOffset === undefined ||
        formSettings.showBanner === undefined) {
      updateFormSetting({
        titleTextXOffset: formSettings.titleTextXOffset !== undefined ? formSettings.titleTextXOffset : 16,
        titleTextYOffset: formSettings.titleTextYOffset !== undefined ? formSettings.titleTextYOffset : 10,
        showBanner: formSettings.showBanner !== false
      });
    }
  }, []);
  
  // Keep local state in sync with context state
  useEffect(() => {
    if (formSettings.titleBackgroundType) {
      setLocalBackgroundType(formSettings.titleBackgroundType);
    }
    if (formSettings.titleBackgroundColor) {
      setLocalColor(formSettings.titleBackgroundColor);
    }
    if (formSettings.titleTextSize && typeof formSettings.titleTextSize === 'number') {
      setTitleTextSize(formSettings.titleTextSize);
    }
    if (formSettings.titleTextColor) {
      setTitleTextColor(formSettings.titleTextColor);
    }
    if (formSettings.titleTextXOffset !== undefined) {
      setTitleTextXOffset(formSettings.titleTextXOffset);
    }
    if (formSettings.titleTextYOffset !== undefined) {
      setTitleTextYOffset(formSettings.titleTextYOffset);
    }
    if (formSettings.showBanner !== undefined) {
      setShowBanner(formSettings.showBanner);
    }
  }, [formSettings]);
  
  const handleToggleChange = (checked: boolean) => {
    const newType = checked ? "image" : "color";
    console.log("Toggle changed to:", newType);
    setLocalBackgroundType(newType);
    
    setTimeout(() => {
      if (newType === "color") {
        // If switching to color mode, apply settings directly
        updateFormSetting({
          titleBackgroundType: "color",
          titleBackgroundColor: localColor
        });
      } else {
        // If switching to image mode, apply the image URL
        updateFormSetting({
          titleBackgroundType: "image",
          titleImageUrl: titleImageUrl || "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg"
        });
      }
    }, 0);
  };

  const handleColorChange = (color: any, hex?: string) => {
    const newColor = typeof hex === 'string' ? hex : color.toHexString();
    console.log("Color changed to:", newColor);
    
    // Update local state immediately for responsive UI
    setLocalColor(newColor);
    
    // Directly update both color and type to ensure consistency
    setTimeout(() => {
      updateFormSetting({
        titleBackgroundType: "color",
        titleBackgroundColor: newColor
      });
    }, 0);
  };

  const handleTextSizeChange = (value: number | null) => {
    const size = value || 24; // Default to 24px if null
    setTitleTextSize(size);
    updateFormSetting({
      titleTextSize: size
    });
  };

  const handleTextColorChange = (color: any, hex?: string) => {
    const newColor = typeof hex === 'string' ? hex : color.toHexString();
    setTitleTextColor(newColor);
    updateFormSetting({
      titleTextColor: newColor
    });
  };

  const handleTextXOffsetChange = (value: number | null) => {
    const offset = value !== null ? value : 16; // Default to 16px if null
    setTitleTextXOffset(offset);
    updateFormSetting({
      titleTextXOffset: offset
    });
  };

  const handleTextYOffsetChange = (value: number | null) => {
    const offset = value !== null ? value : 10; // Default to 10px if null
    setTitleTextYOffset(offset);
    updateFormSetting({
      titleTextYOffset: offset
    });
  };

  const handleShowBannerChange = (checked: boolean) => {
    setShowBanner(checked);
    updateFormSetting({
      showBanner: checked
    });
  };

  // If banner is hidden, only show the toggle to re-enable it
  if (!showBanner) {
    return (
      <>
        <div className="property-setting">
          <Text className="property-name">Title banner</Text>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
          <Text style={{ marginRight: "10px" }}>Show banner</Text>
          <Switch 
            checked={showBanner}
            onChange={handleShowBannerChange}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="property-setting">
        <Text className="property-name">Title banner</Text>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
        <Text style={{ marginRight: "10px" }}>Show banner</Text>
        <Switch 
          checked={showBanner}
          onChange={handleShowBannerChange}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
        <Text style={{ marginRight: "10px" }}>Solid Color</Text>
        <Switch 
          checked={localBackgroundType === "image"}
          onChange={handleToggleChange}
        />
        <Text style={{ marginLeft: "10px" }}>Image</Text>
      </div>
      
      <Collapse 
        expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
        ghost
        defaultActiveKey={["background-settings"]}
      >
        <Panel 
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Text style={{ fontSize: "14px" }}>Settings</Text>
            </div>
          } 
          key="background-settings"
        >
          {localBackgroundType === "image" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text style={{ width: "50px", marginRight: "5px" }}>URL:</Text>
              <Input
                className="file-input"
                type="text"
                placeholder="Enter image URL"
                value={titleImageUrl}
                onChange={updateFormTitleImage}
                style={{ width: "calc(100% - 55px)" }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
              <Text style={{ marginRight: "10px" }}>Background color:</Text>
              <ColorPicker
                value={localColor}
                onChange={handleColorChange}
                trigger="hover"
              />
            </div>
          )}
        </Panel>
      </Collapse>

      <Collapse 
        expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
        ghost
        defaultActiveKey={[]}
        style={{ marginTop: "10px" }}
      >
        <Panel 
          header={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Text style={{ fontSize: "14px" }}>Text editing</Text>
            </div>
          } 
          key="text-settings"
        >
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
              <Text style={{ width: "80px", whiteSpace: "nowrap" }}>Text size:</Text>
              <InputNumber 
                min={10} 
                max={48} 
                value={titleTextSize} 
                onChange={handleTextSizeChange}
                addonAfter="px"
                style={{ width: "100px" }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
              <Text style={{ width: "80px", whiteSpace: "nowrap" }}>Text color:</Text>
              <ColorPicker
                value={titleTextColor}
                onChange={handleTextColorChange}
                trigger="hover"
              />
            </div>
          </div>
          
          <div style={{ marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
              <Text style={{ width: "80px", whiteSpace: "nowrap" }}>X position:</Text>
              <InputNumber 
                min={0} 
                max={500} 
                value={titleTextXOffset} 
                onChange={handleTextXOffsetChange}
                addonAfter="px"
                style={{ width: "100px" }}
              />
            </div>
          </div>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap" }}>
              <Text style={{ width: "80px", whiteSpace: "nowrap" }}>Y position:</Text>
              <InputNumber 
                min={0} 
                max={500} 
                value={titleTextYOffset} 
                onChange={handleTextYOffsetChange}
                addonAfter="px"
                style={{ width: "100px" }}
              />
            </div>
          </div>
        </Panel>
      </Collapse>
    </>
  );
}

export default TitleImage;
