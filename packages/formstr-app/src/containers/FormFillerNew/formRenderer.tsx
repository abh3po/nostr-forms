import { Button, Form, Typography } from "antd";
import { Field, Response, Tag } from "../../nostr/types";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useState } from "react";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import FillerStyle from "./formFiller.style";
import FormBanner from "../../components/FormBanner";
import Markdown from "react-markdown";
import { FormFields } from "./FormFields";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";
import { Link } from "react-router-dom";
import { isMobile } from "../../utils/utility";
import { Event } from "nostr-tools";
import { getAllowedUsers } from "../../utils/formUtils";
import { SubmitButton } from "./SubmitButton/submit";
import { getDefaultRelays } from "../../nostr/common";
import { RequestAccess } from "./RequestAccess";

interface FormRendererProps {
  formSpec: Field[];
  formEvent: Event;
  isPreview: boolean;
  onSubmitClick: (responses: Response[]) => {};
  hideTitleImage?: boolean;
  hiddenDescription?: boolean;
}

const { Text } = Typography;
export const FormRenderer: React.FC<FormRendererProps> = ({
  formSpec,
  formEvent,
  isPreview,
  onSubmitClick,
  hiddenDescription,
  hideTitleImage,
}) => {
  let formId = formEvent.tags.find((t) => t[0])?.[1];
  let pubkey = formEvent.pubkey;
  if (!formSpec || !formId)
    return <Text> Not enough data to render this url </Text>;

  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [formTemplate, setFormTemplate] = useState<Tag[] | null>(
    formSpec || null
  );
  const [form] = Form.useForm();

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
    if (formRelays.length == 0) formRelays = getDefaultRelays();
    let finalRelays = Array.from(new Set(formRelays));
    return finalRelays;
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
    ) as Response[];
    onSubmitClick(responses);
  };
  const renderSubmitButton = (settings: IFormSettings) => {
    if (isPreview) return null;
    let allowedUsers = getAllowedUsers(formEvent);
    if (allowedUsers.length === 0) {
      return (
        <SubmitButton
          selfSign={settings.disallowAnonymous}
          edit={false}
          onSubmit={async () => {
            let formResponses = form.getFieldsValue(true);
            const responses: Response[] = Object.keys(formResponses).map(
              (fieldId: string) => {
                let answer = null;
                let message = null;
                if (formResponses[fieldId])
                  [answer, message] = formResponses[fieldId];
                return [
                  "response",
                  fieldId,
                  answer,
                  JSON.stringify({ message }),
                ];
              }
            );
            onSubmit();
          }}
          form={form}
          relays={getResponseRelays(formEvent)}
          formEvent={formEvent}
        />
      );
    } else if (!userPubKey) {
      return <Button onClick={requestPubkey}>Login to fill this form</Button>;
    } else if (userPubKey && !allowedUsers.includes(userPubKey)) {
      return <RequestAccess pubkey={pubkey!} formId={formId!} />;
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
              <FormBanner
                imageUrl={settings?.titleImageUrl || ""}
                formTitle={name}
              />
            )}
            {!hiddenDescription && (
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
                hiddenDescription ? "hidden-description" : "with-description"
              }
            >
              <div>
                <FormFields fields={fields} handleInput={handleInput} />
              </div>
              {renderSubmitButton(settings)}
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
      </FillerStyle>
    );
  }
};
