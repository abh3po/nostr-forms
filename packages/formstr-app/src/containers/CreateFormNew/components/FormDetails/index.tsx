// FormDetails.tsx
import { Modal, Card, Divider, Typography, Button, Alert } from "antd";
import { useEffect, useState } from "react";
import FormDetailsStyle from "./FormDetails.style";
import { useProfileContext } from "../../../../hooks/useProfileContext";
import {
  constructFormUrl,
  constructNewResponseUrl,
  editPath,
} from "../../../../utils/formUtils";
import { ShareTab } from "./ShareTab";
import { EmbedTab } from "./EmbedTab";
import { SaveStatus } from "./SaveStatus";
import { saveToDevice, saveToMyForms } from "./utils/saveHelpers";
import { CustomSlugForm } from "./payments/customSlugForm";
import axios from "axios";
import { appConfig } from "../../../../config";
import { useNavigate } from "react-router-dom";


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
  const [price , setPrice] = useState(0);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const { pubkey: userPub, requestPubkey } = useProfileContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkServer = async () => {
      try {
        const amountPath = `/api/price`;
        const apiUrl = `${appConfig.apiBaseUrl}${amountPath}`;
        const res = await axios.get(apiUrl);
        setPrice(res.data.amount);
        setServerAvailable(true);
      } catch (error) {
        setServerAvailable(false);
        console.error("Failed to fetch amount:", error);
      }
    };
    checkServer();
  }, []);

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

useEffect(() => {
  const fetchAmount = async () => {
    try {
      const amountPath = `/api/amount`;
      const apiUrl = `${appConfig.apiBaseUrl}${amountPath}`;
      const res = await axios.get(apiUrl);
      console.log("Fetched amount:", res.data.amount);
      setPrice(res.data.amount);
    } catch (error) {
      console.error("Failed to fetch amount:", error);
    }
  };
  fetchAmount();
}, []);

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

          {/* Only show the Custom URL Card if serverAvailable is not false */}
          {(serverAvailable === true || serverAvailable === null) && (
            <Card style={{ marginTop: 5 }}>
              <Typography.Title level={5}>
                Custom URL for Your Form
              </Typography.Title>
              {serverAvailable === null && (
                <Typography.Paragraph type="secondary">
                  Checking server status...
                </Typography.Paragraph>
              )}
              {serverAvailable && (
                <>
                  <Typography.Paragraph type="secondary">
                    Get a personalized form URL like{" "}
                    <Typography.Text code>/i/your-name</Typography.Text> for{" "}
                    <Typography.Text strong>{price} sats</Typography.Text>.
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
                      showAccessWarning={/viewKey/.test(formUrl)}
                      onEditClick={() => navigate(editPath(secretKey, formId, relays[0], viewKey))}
                    />
                  )}
                </>
              )}
            </Card>
          )}

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