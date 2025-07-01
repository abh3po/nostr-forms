import { Button, Divider, Switch, Tooltip, Typography } from "antd";
import StyleWrapper from "./style";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import TitleImage from "./TitleImage";
import { Sharing } from "./Sharing";
import FormIdentifier from "./FormIdentifier";
import { Notifications } from "./Notifications";
import { isMobile } from "../../../../utils/utility";
import RelayManagerModal from './RelayManagerModal';

const { Text } = Typography;

function FormSettings() {
  const {
    formSettings,
    updateFormSetting,
    toggleRelayManagerModal,
    isRelayManagerModalOpen,
  } = useFormBuilderContext();

  const handleAnonymousToggle = (checked: boolean) => {
    updateFormSetting({
      disallowAnonymous: checked,
    });
  };

  const handlePublicForm = (checked: boolean) => {
    updateFormSetting({
      encryptForm: !checked,
    });
  };
  return (
    <StyleWrapper>
      <div className="form-setting">
        <Text className="property-name">Form Identifier</Text>
        <FormIdentifier />
      </div>
      <div className="form-setting">
        <TitleImage titleImageUrl={formSettings.titleImageUrl} />
      </div>
      <Divider className="divider" />
      <div className="form-setting">
        <Text className="property-name">Form Access Settings</Text>
        <Tooltip
          title="This toggle will leave the form un-encrypted and allow anyone to view the form."
          trigger={isMobile() ? "click" : "hover"}
        >
          <div className="property-setting">
            <Text className="property-text">Post to Bulletin Board</Text>
            <Switch
              checked={!formSettings.encryptForm}
              onChange={handlePublicForm}
            />
          </div>
        </Tooltip>
        <Sharing />
      </div>

      <Divider className="divider" />
      <div className="form-setting">
        <Text className="property-name">Notifications</Text>
        <Notifications />
        {formSettings.notifyNpubs?.length ? (
          <Text className="warning-text">
            *These npubs will receive
            <a
              href="https://github.com/nostr-protocol/nips/blob/master/04.md"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              nip-04{" "}
            </a>
            encrypted notifications.
          </Text>
        ) : null}
      </div>
      <Divider className="divider" />
      <div className="form-setting">
        <div className="property-setting">
          <Text className="property-text">Disallow Anonymous Submissions</Text>
          <Switch
            checked={formSettings.disallowAnonymous}
            onChange={handleAnonymousToggle}
          />
        </div>
        {formSettings.disallowAnonymous && (
          <Text className="warning-text">
            *This will require participants to have a nostr profile with a
            <a
              href="https://nostrcheck.me/register/browser-extension.php"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              nip-07 extension
            </a>
          </Text>
        )}
      </div>
      <Divider className="divider" />
      <div className="form-setting">
        <div className="property-setting">
            <Text className="property-name" style={{marginBottom: '8px'}}>Relay Configuration</Text>
        </div>
        <Button 
          onClick={toggleRelayManagerModal} 
          type="default" 
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Manage Relays
        </Button>
      </div>

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