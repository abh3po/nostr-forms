import { Button, Divider, Input, Modal, Switch, Tooltip, Typography } from "antd";
import AddNpubStyle from "../addNpub.style";
import { ReactNode, useState } from "react";
import { isValidNpub } from "./utils";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { useProfileContext } from "../../../../../hooks/useProfileContext";
import { nip19 } from "nostr-tools";
import { isMobile } from "../../../../../utils/utility";

interface ParticipantProps {
  open: boolean;
  onCancel: () => void;
}
const { Text } = Typography;

export const Participants: React.FC<ParticipantProps> = ({
  open,
  onCancel,
}) => {
  const { viewList, setViewList, formSettings, updateFormSetting } = useFormBuilderContext();
  const [newNpub, setNewNpub] = useState<string>();

  const renderList = () => {
    const elements: ReactNode[] = [];
    (viewList || new Set()).forEach(
      (value: string, key: string, set: Set<string>) => {
        elements.push(
          <li>
            <Typography.Text>{nip19.npubEncode(value).substring(0, 10) + "..."}</Typography.Text>
          </li>
        );
      }
    );
    console.log(viewList)
    return <ul>{elements}</ul>;
  };

  return (
    <Modal open={open} onCancel={onCancel} footer={null}>
      <AddNpubStyle className="modal-container">
        <Typography.Text>
          Visibility
        </Typography.Text>
        <Divider />{/*  */}
        <Tooltip
          title="This toggle will encrypt the form, meaning only participants or people with the view key can see it"
          trigger={isMobile() ? "click" : "hover"}>
          <div>
            <Typography.Text>Encrypt Form</Typography.Text>
            <Switch checked={formSettings.encryptForm} onChange={() => updateFormSetting({ ...formSettings, encryptForm: !formSettings.encryptForm })} />
          </div>
        </Tooltip>

        {formSettings.encryptForm && (
          <div style={{ marginTop: '10px' }}>
            <Tooltip
              title="This toggle will include the view key in the form URL meaning anyone with the url will be able to see it."
              trigger={isMobile() ? "click" : "hover"} >
              <div>
                <Typography.Text>Include View Key in Url?</Typography.Text>
                <Switch checked={formSettings.viewKeyInUrl} onChange={() => updateFormSetting({ ...formSettings, viewKeyInUrl: !formSettings.viewKeyInUrl })} />
              </div>
            </Tooltip>
          </div>
        )}
        <Divider />
        {(viewList || {}).size === 0 && !formSettings.encryptForm ? (
          <Typography.Text>
            The form is currently public for everyone
          </Typography.Text>
        ) : null}
        {(viewList || {}).size !== 0 && (
          <Typography.Text>
            Only the npubs below can fill the form
          </Typography.Text>
        )}
        {renderList()}
        <Divider />
        <Typography.Text>Add participants for the form</Typography.Text>
        <Input
          placeholder="Enter nostr npub"
          value={newNpub}
          onChange={(e) => setNewNpub(e.target.value)}
          className="npub-input"
        />
        {newNpub && !isValidNpub(newNpub) && (
          <div>
            <Typography.Text className="error-npub">
              this is not a valid npub
            </Typography.Text>
          </div>
        )}
        <Button
          type="primary"
          className="add-button"
          disabled={!isValidNpub(newNpub || "")}
          onClick={() => {
            setViewList(new Set(viewList).add(nip19.decode(newNpub!).data as string));
            setNewNpub("");
          }}
        >
          {" "}
          Add{" "}
        </Button>
      </AddNpubStyle>
    </Modal>
  );
};
