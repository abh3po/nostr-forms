import { useParams, useSearchParams } from "react-router-dom";
import FormBuilder from "../CreateFormNew/FormBuilder";
import useFormBuilderContext from "../CreateFormNew/hooks/useFormBuilderContext";
import { useEffect, useState } from "react";
import { HEADER_MENU_KEYS } from "../CreateFormNew/components/Header/config";
import { FormFiller } from "../FormFillerNew";
import { getPublicKey, SimplePool } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { getDefaultRelays } from "@formstr/sdk";
import { Spin, Typography } from "antd";
import { getFormSpec as formSpecFromEvent } from "../../utils/formUtils";
import { useProfileContext } from "../../hooks/useProfileContext";
import { LoadingOutlined } from "@ant-design/icons";

function EditForm() {
  const { formSecret, formId } = useParams();
  const { initializeForm, saveDraft, selectedTab, getFormSpec } =
    useFormBuilderContext();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { pubkey: userPub } = useProfileContext();
  const viewKeyParams = searchParams.get("viewKey");

  const fetchFormDataWithFormSecret = async (secret: string, dTag: string) => {
    let formPubkey = getPublicKey(hexToBytes(secret));
    let filter = {
      authors: [formPubkey],
      "#d": [dTag],
      kinds: [30168],
    };
    let pool = new SimplePool();
    let formEvent = await pool.get(getDefaultRelays(), filter);
    if (!formEvent) {
      setError("Form Not Found :(");
      return;
    }
    let formSpec =
      (await formSpecFromEvent(formEvent, userPub, null, viewKeyParams)) || [];
    initializeForm({
      spec: formSpec,
      id: dTag,
      secret: secret,
      viewKey: viewKeyParams,
    });
    setInitialized(true);
  };

  const fetchFormData = async () => {
    if (formSecret && formId) fetchFormDataWithFormSecret(formSecret, formId);
    else {
      setError("Required Params Not Available");
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchFormData();
    }
    return () => {
      if (initialized) {
        saveDraft();
      }
    };
  }, [initialized, initializeForm, saveDraft]);

  if (error) return <Typography.Text>{error}</Typography.Text>;

  if (!initialized)
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography.Text
          style={{
            textAlign: "center",
            display: "block",
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#F7931A" }}
                spin
              />
            }
          />
        </Typography.Text>
      </div>
    );

  if (selectedTab === HEADER_MENU_KEYS.BUILDER) {
    return <FormBuilder />;
  }
  if (selectedTab === HEADER_MENU_KEYS.PREVIEW) {
    return <FormFiller formSpec={getFormSpec()} />;
  }

  return <></>;
}

export default EditForm;
