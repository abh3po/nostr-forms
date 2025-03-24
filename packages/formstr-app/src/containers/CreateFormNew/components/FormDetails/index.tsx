import { Button, Card, Checkbox, Divider, Modal, Spin, Typography } from "antd";
import { ReactComponent as Success } from "../../../../Images/success.svg";
import {
  constructEmbeddedUrl,
  constructFormUrl,
  constructNewResponseUrl,
} from "../../../../utils/formUtils";
import FormDetailsStyle from "./FormDetails.style";
import { useEffect, useState } from "react";
import { CopyButton } from "../../../../components/CopyButton";
import { ILocalForm } from "../../providers/FormBuilder/typeDefs";
import {
  getItem,
  LOCAL_STORAGE_KEYS,
  setItem,
} from "../../../../utils/localStorage";
import { useProfileContext } from "../../../../hooks/useProfileContext";
import { SimplePool, UnsignedEvent } from "nostr-tools";
import { getDefaultRelays } from "@formstr/sdk";
import { KINDS, Tag } from "../../../../nostr/types";

const { Text } = Typography;
interface FormDetailsProps {
  isOpen: boolean;
  pubKey: string;
  secretKey: string;
  viewKey?: string;
  formId: string;
  name: string;
  relay: string;
  onClose: () => void;
}

export const FormDetails: React.FC<FormDetailsProps> = ({
  isOpen,
  pubKey,
  formId,
  onClose,
  secretKey,
  viewKey,
  name,
  relay,
}) => {
  const [savedLocally, setSavedLocally] = useState(false);
  const [savedOnNostr, setSavedOnNostr] = useState<null | "saving" | "saved">(
    null
  );

  const { pubkey: userPub, requestPubkey } = useProfileContext();
  const saveToDevice = (
    formAuthorPub: string,
    formAuthorSecret: string,
    formId: string,
    name: string,
    relay: string,
    viewKey?: string
  ) => {
    let saveObject: ILocalForm = {
      key: `${formAuthorPub}:${formId}`,
      publicKey: `${formAuthorPub}`,
      privateKey: `${formAuthorSecret}`,
      name: name,
      formId: formId,
      relay: relay,
      createdAt: new Date().toString(),
    };
    if (viewKey) saveObject.viewKey = viewKey;
    let forms =
      getItem<Array<ILocalForm>>(LOCAL_STORAGE_KEYS.LOCAL_FORMS) || [];
    const existingKeys = forms.map((form) => form.key);
    if (existingKeys.includes(saveObject.key)) {
      setSavedLocally(true);
      return;
    }
    forms.push(saveObject);
    setItem(LOCAL_STORAGE_KEYS.LOCAL_FORMS, forms);
    setSavedLocally(true);
  };

  type SetupResult = {
    status: "exists" | "ready";
    forms: Tag[];
  };

  const saveToMyForms = async (
    formAuthorPub: string,
    formAuthorSecret: string,
    formId: string,
    relay: string,
    viewKey?: string
  ) => {
    if (!userPub) return;

    setSavedOnNostr("saving");
    const pool = new SimplePool();
    const relays = getDefaultRelays();

    try {
      if (!window.nostr) {
        throw new Error("Nostr client not available");
      }

      const setupWithTimeout = async (): Promise<SetupResult> => {
        return new Promise(async (resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Setup timed out after 15s"));
          }, 10000);

          try {
            const existingList = await pool.querySync(relays, {
              kinds: [KINDS.myFormsList],
              authors: [userPub],
            });

            let forms: Tag[] = [];
            if (existingList[0]) {
              const formsString = await window.nostr.nip44.decrypt(
                userPub,
                existingList[0].content
              );
              forms = JSON.parse(formsString);
            }

            const key = `${formAuthorPub}:${formId}`;
            if (forms.map((f) => f[1]).includes(key)) {
              console.log("Form already exists in your saved forms");
              clearTimeout(timeoutId);
              resolve({ status: "exists", forms });
              return;
            }

            clearTimeout(timeoutId);
            resolve({ status: "ready", forms });
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      };

      const setupResult = await setupWithTimeout();

      if (setupResult.status === "exists") {
        setSavedOnNostr("saved");
        return;
      }

      let secrets = `${formAuthorSecret}`;
      if (viewKey) secrets = `${secrets}:${viewKey}`;

      const forms = setupResult.forms;
      forms.push(["f", `${formAuthorPub}:${formId}`, relay, secrets]);

      const encryptedString = await window.nostr.nip44.encrypt(
        userPub,
        JSON.stringify(forms)
      );

      const myFormEvent: UnsignedEvent = {
        kind: KINDS.myFormsList,
        content: encryptedString,
        pubkey: userPub,
        tags: [],
        created_at: Math.round(Date.now() / 1000),
      };

      const signedEvent = await window.nostr.signEvent(myFormEvent);
      await Promise.allSettled(pool.publish(relays, signedEvent));

      setSavedOnNostr("saved");
    } catch (error) {
      console.error("Failed to save to nostr:", error);
      setSavedOnNostr(null);
    } finally {
      pool.close(relays);
    }
  };

  useEffect(() => {
    saveToDevice(pubKey, secretKey, formId, name, relay, viewKey);
    if (userPub) saveToMyForms(pubKey, secretKey, formId, relay, viewKey);
  }, [userPub]);

  type TabKeyType = "share" | "embed";
  type OptionType = "hideTitleImage" | "hideDescription";
  const [activeTab, setActiveTab] = useState<TabKeyType>("share");
  const [embedOptions, setEmbedOptions] = useState<{
    hideTitleImage?: boolean;
    hideDescription?: boolean;
  }>({});

  const handleCheckboxChange = (option: OptionType) => {
    setEmbedOptions({
      ...embedOptions,
      [option]: !embedOptions[option],
    });
  };

  const formUrl = constructFormUrl(pubKey, formId, relay, viewKey);
  const responsesUrl = constructNewResponseUrl(
    secretKey,
    formId,
    relay,
    viewKey
  );

  function getIframeContent() {
    return `<iframe src="${constructEmbeddedUrl(
      pubKey,
      formId,
      embedOptions,
      relay,
      viewKey
    )}" height="700px" width="480px" frameborder="0" style="border-style:none;box-shadow:0px 0px 2px 2px rgba(0,0,0,0.2);" cellspacing="0" ></iframe>`;
  }
  const tabList = [
    {
      key: "share",
      label: "Share",
    },
    {
      key: "embed",
      tab: "Embed",
    },
  ];

  const TabContent = {
    share: (
      <div className="share-links">
        <div>
          <Success />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>
            <Text> Your form is now live at the below url! </Text>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <a href={formUrl}>{formUrl}</a>
            <CopyButton
              getText={() => {
                return formUrl;
              }}
              textBefore=""
              textAfter=""
            />
          </div>
        </div>

        {responsesUrl && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>
              <Text>
                {" "}
                You can see responses for this form at the below url{" "}
              </Text>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <a href={responsesUrl}>{responsesUrl}</a>
              <CopyButton
                getText={() => {
                  return responsesUrl!;
                }}
                textBefore=""
                textAfter=""
              />
            </div>
          </div>
        )}
      </div>
    ),
    embed: (
      <div className="embedded-share">
        <div className="settings-container">
          <label className="settings-item">Embed Settings:</label>
          <Checkbox
            checked={embedOptions.hideTitleImage}
            onChange={() => handleCheckboxChange("hideTitleImage")}
            className="settings-item"
          >
            Hide Title Image
          </Checkbox>
          <Checkbox
            checked={embedOptions.hideDescription}
            onChange={() => handleCheckboxChange("hideDescription")}
            className="settings-item"
          >
            Hide Description
          </Checkbox>
        </div>
        <div className="embed-container">
          <code className="embedded-code">{getIframeContent()}</code>
        </div>
        <div>
          <CopyButton getText={getIframeContent} textBefore="" textAfter="" />
        </div>
      </div>
    ),
  };

  const SaveStatus = () => {
    return (
      <div className="save-status">
        <div>Saved Locally? {savedLocally ? "✅" : "❌"}</div>
        {userPub ? (
          <div className="nostr-save-status">
            {savedOnNostr === "saving" ? (
              <div className="saving-indicator">
                <Text>Saving to nostr profile...</Text>
                <Spin size="small" style={{ marginLeft: 4 }} />
              </div>
            ) : (
              <div>
                Saved To Profile? {savedOnNostr === "saved" ? "✅" : "❌"}
              </div>
            )}
          </div>
        ) : (
          <div className="login-prompt">
            <Text>Login to save to your profile</Text>
            <Button onClick={requestPubkey} className="ml-2">
              Login
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="auto"
    >
      <FormDetailsStyle className="form-details">
        <Card
          bordered={false}
          tabList={tabList}
          className="form-details-card"
          onTabChange={(key: string) => setActiveTab(key as TabKeyType)}
        >
          {TabContent[activeTab]}
          <Divider />
          <SaveStatus />
        </Card>
      </FormDetailsStyle>
    </Modal>
  );
};

