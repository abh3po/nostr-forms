import {
  Button,
  Collapse,
  Divider,
  Popover,
  Input,
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

const { Text } = Typography;
const { Panel } = Collapse;

function FormSettings() {
  const {
    formSettings,
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
            <Text className="warning-text">
              *This will require participants to have a nostr profile with a{" "}
              <a
                href="https://nostrcheck.me/register/browser-extension.php"
                target="_blank"
                rel="noreferrer"
              >
                nip-07 extension
              </a>
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
          <div
            className="property-setting"
            style={{ flexDirection: "column", gap: 8 }}
          >
            <Text className="property-text">NRPC Server Pubkey</Text>
            <Input
              placeholder="npub1..."
              value={formSettings.nrpcPubkey}
              onChange={(e) =>
                updateFormSetting({ nrpcPubkey: e.target.value })
              }
              style={{ width: "100%" }}
            />
          </div>

          <div
            className="property-setting"
            style={{ flexDirection: "column", gap: 8, marginTop: 16 }}
          >
            <Text className="property-text">Method to Call</Text>
            <Input
              placeholder="methodName"
              value={formSettings.nrpcMethod}
              onChange={(e) =>
                updateFormSetting({ nrpcMethod: e.target.value })
              }
              style={{ width: "100%" }}
            />
          </div>

          <Text
            type="secondary"
            style={{ fontSize: 12, marginTop: 12, display: "block" }}
          >
            After form submission, Formstr will send an NRPC request to the
            configured server with the form responses.
          </Text>
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
