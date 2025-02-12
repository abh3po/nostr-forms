import { useLocation, useParams, useSearchParams } from "react-router-dom";
import FormBuilder from "../CreateFormNew/FormBuilder";
import useFormBuilderContext from "../CreateFormNew/hooks/useFormBuilderContext";
import { useEffect, useState } from "react";
import { HEADER_MENU_KEYS } from "../CreateFormNew/components/Header/config";
import { FormFiller } from "../FormFillerNew";
import { getPublicKey, SimplePool } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { getDefaultRelays } from "@formstr/sdk";
import { FormInitData } from "../CreateFormNew/providers/FormBuilder/typeDefs";
import { Spin, Typography } from "antd";
import { getFormSpec as formSpecFromEvent } from "../../utils/formUtils";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { useProfileContext } from "../../hooks/useProfileContext";

function EditForm() {
  const { naddr, formSecret, formId } = useParams();
  const { initializeForm, saveDraft, selectedTab, getFormSpec } =
    useFormBuilderContext();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { pubkey: userPub } = useProfileContext();
  const viewKeyParams = searchParams.get("viewKey");

  const fetchFormDataWithFormSecret = async (secret: string, dTag: string) => {
    console.log("FETCHIUNG FORM WITH SECRET", secret, dTag);
    let formPubkey = getPublicKey(hexToBytes(secret));
    let filter = {
      authors: [formPubkey],
      "#d": [dTag],
      kinds: [30168],
    };
    let pool = new SimplePool();
    let formEvent = await pool.get(getDefaultRelays(), filter);
    console.log("FORM EVENT IS", formEvent);
    if (!formEvent) {
      setError("Form Not Found :(");
      return;
    }
    console.log("Form Event is");
    initializeForm({
      spec:
        (await formSpecFromEvent(formEvent, userPub, null, viewKeyParams)) ||
        [],
      id: dTag,
      secret: secret,
    });
    setInitialized(true);
  };

  const fetchFormDatawithNaddr = (naddr: string) => {};

  const fetchFormData = async () => {
    console.log("IN THIS WE HAVE", formSecret, formId, naddr);
    if (formSecret && formId) fetchFormDataWithFormSecret(formSecret, formId);
    else if (naddr) fetchFormDatawithNaddr(naddr);
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

  if (!initialized) return <Spin spinning={true} size="default" />;

  if (selectedTab === HEADER_MENU_KEYS.BUILDER) {
    return <FormBuilder />;
  }
  if (selectedTab === HEADER_MENU_KEYS.PREVIEW) {
    return <FormFiller formSpec={getFormSpec()} />;
  }

  return <></>;
}

export default EditForm;
