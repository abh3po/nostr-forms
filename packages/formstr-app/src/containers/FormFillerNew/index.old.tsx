import { Field, Tag, Option, Response } from "@formstr/sdk/dist/formstr/nip101";
import FillerStyle from "./formFiller.style";
import FormTitle from "../CreateFormNew/components/FormTitle";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Form, Spin, Typography } from "antd";
import { ThankYouScreen } from "./ThankYouScreen";
import { SubmitButton } from "./SubmitButton/submit";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";
import Markdown from "react-markdown";
import { Event, nip19 } from "nostr-tools";
import { FormFields } from "./FormFields";
import { RequestAccess } from "./RequestAccess";
import { fetchFormTemplate } from "@formstr/sdk/dist/formstr/nip101/fetchFormTemplate";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { AddressPointer } from "nostr-tools/nip19";
import { LoadingOutlined } from "@ant-design/icons";
import { sendNotification } from "../../nostr/common";
import { sendResponses } from "../../nostr/common";

const { Text } = Typography;

interface FormFillerProps {
  formSpec?: Tag[];
  embedded?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({
  formSpec,
  embedded,
}) => {
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
  const [formTemplate, setFormTemplate] = useState<Tag[] | null>(
    formSpec || null
  );
  const [form] = Form.useForm();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [noAccess, setNoAccess] = useState<boolean>(false);
  const [editKey, setEditKey] = useState<string | undefined | null>();
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [formEvent, setFormEvent] = useState<Event | undefined>();
  const [searchParams] = useSearchParams();
  const hideTitleImage = searchParams.get("hideTitleImage") === "true";
  const viewKeyParams = searchParams.get("viewKey");
  const hideDescription = searchParams.get("hideDescription") === "true";
  const navigate = useNavigate();

  if (!formId && !formSpec) {
    return null;
  }

  const onKeysFetched = (keys: Tag[] | null) => {
    let editKey = keys?.find((k) => k[0] === "EditAccess")?.[1] || null;
    setEditKey(editKey);
  };

  const initialize = async (
    formAuthor: string,
    formId: string,
    relays?: string[]
  ) => {
    if (!formEvent) {
      const form = await fetchFormTemplate(formAuthor, formId, relays);
      if (!form) return;
      setFormEvent(form);
      setAllowedUsers(getAllowedUsers(form));
      const formSpec = await getFormSpec(
        form,
        userPubKey,
        onKeysFetched,
        viewKeyParams
      );
      if (!formSpec) setNoAccess(true);
      setFormTemplate(formSpec);
    }
  };

  useEffect(() => {
    if (!(pubKey && formId)) {
      return;
    }
    initialize(pubKey, formId, relays);
  }, [formEvent, formTemplate, userPubKey]);

  const handleInput = (
    questionId: string,
    answer: string,
    message?: string
  ) => {
    if (!answer || answer === "") {
      form.setFieldValue(questionId, null);
      return;
    }
    form.setFieldValue(questionId, [answer, message]);
  };

  const getResponseRelays = (formEvent: Event) => {
    let formRelays = formEvent.tags
      .filter((r) => r[0] === "relay")
      ?.map((r) => r[1]);
    let finalRelays = Array.from(new Set([...(relays || []), ...(formRelays || [])]));
    return finalRelays
  };

  const onSubmit = async () => {
    let formResponses = form.getFieldsValue(true);
    const responses: Response[] = Object.keys(formResponses).map(
      (fieldId: string) => {
        let answer = null;
        let message = null;
        if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
        return ["response", fieldId, answer, JSON.stringify({ message })];
      }
    );
    sendNotification(formTemplate!, responses);
    setFormSubmitted(true);
  };

  const renderSubmitButton = (settings: IFormSettings) => {
    if (isPreview) return null;
    if (!formEvent) return null;
    if (allowedUsers.length === 0) {
      return (
        <SubmitButton
          selfSign={settings.disallowAnonymous}
          edit={false}
          onSubmit={onSubmit}
          form={form}
          relays={getResponseRelays(formEvent)}
          formEvent={formEvent}
        />
      );
    } else if (!userPubKey) {
      return <Button onClick={requestPubkey}>Login to fill this form</Button>;
    } else if (userPubKey && !allowedUsers.includes(userPubKey)) {
      return <RequestAccess pubkey={pubKey!} formId={formId!} />;
    } else {
      return (
        <SubmitButton
          selfSign={true}
          edit={false}
          onSubmit={onSubmit}
          form={form}
          relays={getResponseRelays(formEvent)}
          formEvent={formEvent}
        />
      );
    }
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
  if (noAccess) {
    return (
      <>
        <Text>Your profile does not have access to view this form</Text>
        <RequestAccess pubkey={pubKey!} formId={formId!} />
      </>
    );
  }
  let name: string, settings: IFormSettings, fields: Field[];
  if (formTemplate) {
    name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
    settings = JSON.parse(
      formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}"
    ) as IFormSettings;
    fields = formTemplate.filter((tag) => tag[0] === "field") as Field[];

    return (
      <FillerStyle $isPreview={isPreview}>
        <div className="filler-container">
          <div className="form-filler">
            {!hideTitleImage && (
              <FormTitle
                className="form-title"
                edit={false}
                imageUrl={settings?.titleImageUrl}
                formTitle={name}
              />
            )}
            {!hideDescription && (
              <div className="form-description">
                <Text>
                  <Markdown>{settings?.description}</Markdown>
                </Text>
              </div>
            )}

            <Form
              form={form}
              onFinish={() => {}}
              className={
                hideDescription ? "hidden-description" : "with-description"
              }
            >
              <div>
                <FormFields fields={fields} handleInput={handleInput} />
                <>{renderSubmitButton(settings)}</>
              </div>
            </Form>
          </div>
          <div className="branding-container">
            <Link to="/">
              <CreatedUsingFormstr />
            </Link>
            {!isMobile() && (
              <a
                href="https://github.com/abhay-raizada/nostr-forms"
                className="foss-link"
              >
                <Text className="text-style">
                  Formstr is free and Open Source
                </Text>
              </a>
            )}
          </div>
        </div>
        {embedded ? (
          formSubmitted && (
            <div className="embed-submitted">
              {" "}
              <Text>Response Submitted</Text>{" "}
            </div>
          )
        ) : (
          <ThankYouScreen
            isOpen={formSubmitted}
            onClose={() => {
              let navigationUrl = editKey ? `/r/${pubKey}/${formId}` : `/`;
              navigate(navigationUrl);
            }}
          />
        )}
      </FillerStyle>
    );
  }
};
