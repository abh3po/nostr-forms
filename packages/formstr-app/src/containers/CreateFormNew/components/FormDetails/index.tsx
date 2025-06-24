// FormDetails.tsx
import { Modal, Card, Divider, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import FormDetailsStyle from "./FormDetails.style";
import { useProfileContext } from "../../../../hooks/useProfileContext";
import {
  constructFormUrl,
  constructNewResponseUrl,
} from "../../../../utils/formUtils";
import { ShareTab } from "./ShareTab";
import { EmbedTab } from "./EmbedTab";
import { SaveStatus } from "./SaveStatus";
import { saveToDevice, saveToMyForms } from "./utils/saveHelpers";
import { CustomSlugForm } from "./payments/customSlugForm";

export const FormDetails = ({
  isOpen,
  pubKey,
  formId,
  secretKey,
  viewKey,
  name,
  relays,
  onClose,
}: {
  isOpen: boolean;
  pubKey: string;
  formId: string;
  secretKey: string;
  viewKey: string;
  name: string;
  relays: string[];
  onClose: () => void;
}) => {
  const [savedLocally, setSavedLocally] = useState(false);
  const [savedOnNostr, setSavedOnNostr] = useState<null | "saving" | "saved">(
    null
  );
  const [showCustomForm, setShowCustomForm] = useState(false);
  const { pubkey: userPub, requestPubkey } = useProfileContext();

  useEffect(() => {
    saveToDevice(
      pubKey,
      secretKey,
      formId,
      name,
      relays,
      () => {
        setSavedLocally(true);
      },
      viewKey
    );
    if (userPub)
      saveToMyForms(
        pubKey,
        secretKey,
        formId,
        relays,
        userPub,
        setSavedOnNostr,
        viewKey
      );
  }, [userPub]);

  const formUrl = constructFormUrl(pubKey, formId, relays, viewKey);
  const responsesUrl = constructNewResponseUrl(
    secretKey,
    formId,
    relays,
    viewKey
  );

  const [activeTab, setActiveTab] = useState<"share" | "embed">("share");

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={600}
    >
      <FormDetailsStyle className="form-details">
        <Card
          bordered={false}
          tabList={[
            { key: "share", label: "Share" },
            { key: "embed", label: "Embed" },
          ]}
          onTabChange={(key) => setActiveTab(key as "share" | "embed")}
        >
          {activeTab === "share" ? (
            <ShareTab formUrl={formUrl} responsesUrl={responsesUrl} />
          ) : (
            <EmbedTab
              pubKey={pubKey}
              formId={formId}
              relays={relays}
              viewKey={viewKey}
            />
          )}
          <Card style={{ marginTop: 5 }}>
            <Typography.Title level={5}>
              Custom URL for Your Form
            </Typography.Title>
            <Typography.Paragraph type="secondary">
              Get a personalized form URL like{" "}
              <Typography.Text code>/t/your-name</Typography.Text> for{" "}
              <Typography.Text strong>2500 sats</Typography.Text>.
              <br />
              This one-time purchase is tied to your{" "}
              <Typography.Text code>Nostr</Typography.Text> profile.
            </Typography.Paragraph>

            {!showCustomForm ? (
              <Button
                type="primary"
                onClick={() =>
                  userPub ? setShowCustomForm(true) : requestPubkey
                }
                disabled={!userPub}
              >
                {userPub ? "Claim Custom URL" : "Login to claim custom URL"}
              </Button>
            ) : (
              <CustomSlugForm
                formId={formId}
                formPubkey={pubKey}
                relays={relays}
                viewKey={viewKey}
              />
            )}
          </Card>

          <Divider />
          <SaveStatus
            savedLocally={savedLocally}
            savedOnNostr={savedOnNostr}
            userPub={userPub}
            requestPubkey={requestPubkey}
          />
        </Card>
      </FormDetailsStyle>
    </Modal>
  );
};
