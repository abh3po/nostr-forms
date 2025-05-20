// FormDetails.tsx
import { Modal, Card, Divider } from "antd";
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
import { ZapQRCodeModal } from "./payments/zapQRModal";
import { useNavigate } from "react-router-dom"; // or next/router if using Next.js

export const FormDetails = ({
  isOpen,
  pubKey,
  formId,
  secretKey,
  viewKey,
  name,
  relay,
  onClose,
}: any) => {
  const [savedLocally, setSavedLocally] = useState(false);
  const [savedOnNostr, setSavedOnNostr] = useState<null | "saving" | "saved">(
    null
  );
  const [invoice, setInvoice] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const navigate = useNavigate(); // or useRouter()
  const { pubkey: userPub, requestPubkey } = useProfileContext();

  const handleInvoiceReady = (inv: string, hash: string) => {
    setInvoice(inv);
    setHash(hash);
  };

  const handleZapSuccess = () => {
    navigate(`/i/${hash}`);
  };

  useEffect(() => {
    saveToDevice(
      pubKey,
      secretKey,
      formId,
      name,
      relay,
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
        relay,
        userPub,
        setSavedOnNostr,
        viewKey
      );
  }, [userPub]);

  const formUrl = constructFormUrl(pubKey, formId, relay, viewKey);
  const responsesUrl = constructNewResponseUrl(
    secretKey,
    formId,
    relay,
    viewKey
  );

  const [activeTab, setActiveTab] = useState<"share" | "embed">("share");

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
              relay={relay}
              viewKey={viewKey}
            />
          )}
          <CustomSlugForm onInvoiceReady={handleInvoiceReady} />
          <ZapQRCodeModal
            open={!!invoice}
            invoice={invoice!}
            hash={hash!}
            onSuccess={handleZapSuccess}
            onClose={() => setInvoice(null)}
          />
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
