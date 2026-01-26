import {
  Button,
  Collapse,
  Divider,
  Popover,
  Input,
  Select,
  Slider,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import StyleWrapper from "./style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import TitleImage from "./TitleImage";
import { Sharing } from "./Sharing";
import FormIdentifier from "./FormIdentifier";
import { Notifications } from "./Notifications";
import { isMobile } from "../../../../utils/utility";
import RelayManagerModal from "./RelayManagerModal";
import { BackgroundImageSetting } from "./BackgroundImage";
import { SketchPicker, ColorResult } from "react-color";
import { useState } from "react";
import { ThankYouScreenImageSetting } from "./ThankYouImage";

const { Text } = Typography;
const { Panel } = Collapse;
import Automations from "./Automations";

function FormSettings() {
  const {
    formSettings,
    relayList,
    updateFormSetting,
    toggleRelayManagerModal,
    isRelayManagerModalOpen,
  } = useFormBuilderContext();
  const [color, setColor] = useState(formSettings.globalColor || "#000000");
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleColorChange = (c: ColorResult) => {
    setColor(c.hex);
    updateFormSetting({ globalColor: c.hex });
  };
  const clearColor = () => {
    setColor("#000000");
    updateFormSetting({ globalColor: "#000000" });
    setPickerOpen(false);
  };
  return (
    <StyleWrapper>
      {/* Always visible */}
      <div className="form-setting">
        <Text className="property-name">Form Identifier</Text>
        <FormIdentifier />
      </div>

      {/* Collapsible groups */}
      <Collapse expandIconPosition="end">
        <Panel header="Access & Participants" key="access">
          <Tooltip
            title="This toggle will leave the form un-encrypted and allow anyone to view the form."
            trigger={isMobile() ? "click" : "hover"}
          >
            <div className="property-setting">
              <Text className="property-text">Post to Bulletin Board</Text>
              <Switch
                checked={!formSettings.encryptForm}
                onChange={(checked) =>
                  updateFormSetting({ encryptForm: !checked })
                }
              />
            </div>
          </Tooltip>
          <Sharing />

          <Divider className="divider" />

          <div className="property-setting">
            <Text className="property-text">
              Disallow Anonymous Submissions
            </Text>
            <Switch
              checked={formSettings.disallowAnonymous}
              onChange={(checked) =>
                updateFormSetting({ disallowAnonymous: checked })
              }
            />
          </div>
          {formSettings.disallowAnonymous && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              *This will require participants to be logged in with their Nostr
              account
            </Text>
          )}
          <Divider className="divider" />
          <Tooltip
            title="If enabled, Formstr servers can access your form to generate previews."
            trigger={isMobile() ? "click" : "hover"}
          >
            <div className="property-setting">
              <Text className="property-text">Disable Link Previews</Text>
              <Switch
                checked={formSettings.disablePreview}
                onChange={(checked) =>
                  updateFormSetting({ disablePreview: checked })
                }
              />
            </div>
          </Tooltip>
          {!formSettings.disablePreview && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              *Link preview generation is enabled. Formstr servers will be able
              to see the form template. This is required to generate the preview
              of the form.
            </Text>
          )}
        </Panel>

        <Panel header="Notifications" key="notifications">
          <Notifications />
        </Panel>

        <Panel header="Customization" key="customization">
          <div className="property-setting">
            <div>Global Color</div>
            <Popover
              open={pickerOpen}
              onOpenChange={(open) => setPickerOpen(open)}
              content={
                <div style={{ padding: 4 }}>
                  <SketchPicker color={color} onChange={handleColorChange} />
                  <div style={{ marginTop: 8, textAlign: "right" }}>
                    <Button size="small" onClick={clearColor}>
                      Clear
                    </Button>
                  </div>
                </div>
              }
              placement="topLeft"
              overlayStyle={{ padding: 0 }}
              destroyTooltipOnHide
            >
              <div
                role="button"
                aria-label="Open color picker"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: "0 0 0 1px #fff, 0 1px 3px rgba(0,0,0,.2)",
                  cursor: "pointer",
                }}
              />
            </Popover>
          </div>
          <Divider className="divider" />
          <TitleImage titleImageUrl={formSettings.titleImageUrl} />
          <Divider className="divider" />
          <BackgroundImageSetting
            value={formSettings.backgroundImageUrl}
            onChange={(url: string) => {
              updateFormSetting({ backgroundImageUrl: url });
            }}
          />
          <ThankYouScreenImageSetting
            value={formSettings.thankYouScreenImageUrl}
            onChange={(url: string) => {
              updateFormSetting({ thankYouScreenImageUrl: url });
            }}
          />
          <Divider className="divider" />
          <div className="property-setting">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text>Card Transparency</Text>
              <Slider
                min={0.5}
                max={1}
                step={0.01}
                value={formSettings.cardTransparency}
                onChange={(value) =>
                  updateFormSetting({ cardTransparency: value })
                }
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Adjust transparency of form cards (0 = fully transparent, 1 =
                fully opaque)
              </Text>
            </div>
          </div>
          <Tooltip
            title="This toggle will add Formstr branding to the bottom of your form."
            trigger={isMobile() ? "click" : "hover"}
          >
            <div className="property-setting">
              <Text className="property-text">Add Formstr branding</Text>
              <Switch
                checked={formSettings.formstrBranding}
                onChange={(checked) =>
                  updateFormSetting({ formstrBranding: checked })
                }
              />
            </div>
          </Tooltip>
        </Panel>

        <Panel header="Relay Configuration" key="relays">
          <Button
            onClick={toggleRelayManagerModal}
            type="default"
            style={{ width: "100%" }}
          >
            Manage Relays
          </Button>
        </Panel>
        <Panel header="Automations" key="nrpc-webhook">
          <Automations />
        </Panel>
      </Collapse>

      {isRelayManagerModalOpen && (
        <RelayManagerModal
          isOpen={isRelayManagerModalOpen}
          onClose={toggleRelayManagerModal}
        />
      )}
    </StyleWrapper>
  );
}

export default FormSettings;
