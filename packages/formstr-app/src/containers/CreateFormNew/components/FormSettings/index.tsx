import {
  Button,
  Collapse,
  Divider,
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

const { Text } = Typography;
const { Panel } = Collapse;

function FormSettings() {
  const {
    formSettings,
    updateFormSetting,
    toggleRelayManagerModal,
    isRelayManagerModalOpen,
  } = useFormBuilderContext();

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
          <TitleImage titleImageUrl={formSettings.titleImageUrl} />
          <Divider className="divider" />
          <BackgroundImageSetting
            value={formSettings.backgroundImageUrl}
            onChange={(url: string) => {
              updateFormSetting({ backgroundImageUrl: url });
            }}
          />
          <div className="property-setting">
            <div style={{display: "flex", flexDirection: "column"}}>
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
