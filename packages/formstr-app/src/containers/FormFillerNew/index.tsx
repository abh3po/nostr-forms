import { Tag, Response } from "@formstr/sdk/dist/formstr/nip101";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Spin, Typography } from "antd";
import { Event, nip19 } from "nostr-tools";
import { fetchFormTemplate } from "../../nostr/fetchFormTemplate";
import { useProfileContext } from "../../hooks/useProfileContext";
import { AddressPointer } from "nostr-tools/nip19";
import { LoadingOutlined } from "@ant-design/icons";
import { sendNotification } from "../../nostr/common";
import { FormRendererContainer } from "./FormRendererContainer";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { ThankYouScreen } from "./ThankYouScreen";
import { ROUTES } from "../../constants/routes";

const { Text } = Typography;

interface FormFillerProps {
  formSpec?: Tag[];
  embedded?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({ formSpec }) => {
  const { naddr } = useParams();
  let isPreview = !!formSpec;
  if (!isPreview && !naddr)
    return <Text> Not enough data to render this url </Text>;
  let decodedData;
  if (!isPreview) decodedData = nip19.decode(naddr!).data as AddressPointer;
  let pubKey = decodedData?.pubkey;
  let formId = decodedData?.identifier;
  let relays = decodedData?.relays;
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formEvent, setFormEvent] = useState<Event | undefined>();
  const [searchParams] = useSearchParams();
  const hideTitleImage = searchParams.get("hideTitleImage") === "true";
  const viewKeyParams = searchParams.get("viewKey");
  const hideDescription = searchParams.get("hideDescription") === "true";
  const navigate = useNavigate();

  const { poolRef } = useApplicationContext();

  console.log("FORM SUBMITTED?", formSubmitted);
  if (!formId && !formSpec) {
    return null;
  }

  const initialize = async (
    formAuthor: string,
    formId: string,
    relays?: string[]
  ) => {
    const form = await fetchFormTemplate(
      formAuthor,
      formId,
      poolRef.current,
      (event: Event) => {
        setFormEvent(event);
      },
      relays
    );
  };

  useEffect(() => {
    if (!(pubKey && formId)) {
      return;
    }
    if (!formEvent) initialize(pubKey, formId, relays);
  }, []);

  const onSubmit = async (responses: Response[], formTemplate: Tag[]) => {
    sendNotification(formTemplate, responses);
    setFormSubmitted(true);
  };

  if ((!pubKey || !formId) && !isPreview) {
    return <Text>INVALID FORM URL</Text>;
  }
  if (!formEvent && !isPreview) {
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
        <Text
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
        </Text>
      </div>
    );
  } else if (
    !isPreview &&
    formEvent?.content !== "" &&
    !userPubKey &&
    !viewKeyParams
  ) {
    return (
      <>
        <Text>
          This form is access controlled and requires login to continue
        </Text>
        <Button
          onClick={() => {
            requestPubkey();
          }}
        >
          Login
        </Button>
      </>
    );
  }
  if (formEvent) {
    return (
      <>
        <FormRendererContainer
          formEvent={formEvent!}
          onSubmitClick={onSubmit}
          viewKey={viewKeyParams}
          hideTitleImage={hideTitleImage}
          hideDescription={hideDescription}
        />
        <ThankYouScreen
          isOpen={formSubmitted}
          onClose={() => navigate(ROUTES.DASHBOARD)}
        />
      </>
    );
  }
};
