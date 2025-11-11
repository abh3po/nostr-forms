import { Button, Form, Typography } from "antd";
import { Event } from "nostr-tools";
import { Response, Tag } from "../../nostr/types";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { SubmitButton } from "./SubmitButton/submit";
import { FormRenderer } from "./FormRenderer";
import { useEffect, useState } from "react";
import { getResponseRelays } from "../../utils/ResponseUtils";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { sendNRPCWebhook } from "../../nostr/common";

const { Text } = Typography;

interface FormRendererContainerProps {
  formEvent: Event;
  onSubmitClick: (responses: Response[], formTemplate: Tag[]) => void;
  viewKey: string | null;
  hideTitleImage?: boolean;
  hideDescription?: boolean;
}

export const FormRendererContainer: React.FC<FormRendererContainerProps> = ({
  formEvent,
  onSubmitClick,
  viewKey,
  hideDescription,
  hideTitleImage,
}) => {
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [form] = Form.useForm();
  const [formTemplate, setFormTemplate] = useState<Tag[]>();
  const [settings, setSettings] = useState<IFormSettings>();

  useEffect(() => {
    const initialize = async () => {
      if (formEvent.content === "") {
        setFormTemplate(formEvent.tags);
        const settingsTag = formEvent.tags.find((tag) => tag[0] === "settings");
        if (settingsTag) {
          const parsedSettings = JSON.parse(
            settingsTag[1] || "{}"
          ) as IFormSettings;
          setSettings(parsedSettings);
        }
        return;
      }

      const formSpec = await getFormSpec(
        formEvent,
        userPubKey,
        () => {},
        viewKey
      );
      if (formSpec) {
        const settings = JSON.parse(
          formSpec.find((tag) => tag[0] === "settings")?.[1] || "{}"
        ) as IFormSettings;
        setSettings(settings);
        setFormTemplate(formSpec);
      }
    };
    initialize();
  }, []);

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

  const onSubmit = async () => {
    try {
      const formResponses = form.getFieldsValue(true);
      const responses: Response[] = Object.keys(formResponses).map(
        (fieldId) => {
          let answer = null;
          let message = null;
          if (formResponses[fieldId])
            [answer, message] = formResponses[fieldId];
          return ["response", fieldId, answer, JSON.stringify({ message })];
        }
      );
      onSubmitClick(responses, formTemplate!);
    } catch (error) {
      console.error("Form validation failed:", error);
      // The form will automatically show validation errors
    }
  };

  const allowedUsers = getAllowedUsers(formEvent);
  let footer: React.ReactNode = null;

  if (allowedUsers.length === 0) {
    footer = (
      <SubmitButton
        selfSign={!!settings?.disallowAnonymous}
        edit={false}
        onSubmit={onSubmit}
        form={form}
        relays={getResponseRelays(formEvent)}
        formEvent={formEvent}
        formTemplate={formTemplate!}
      />
    );
  } else if (!userPubKey) {
    footer = (
      <Button type="primary" onClick={requestPubkey}>
        Login to fill this form
      </Button>
    );
  } else if (!allowedUsers.includes(userPubKey)) {
    footer = (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Text type="warning" style={{ fontSize: "16px" }}>
          You do not have permission to view this form
        </Text>
      </div>
    );
  } else {
    footer = (
      <SubmitButton
        selfSign={true}
        edit={false}
        onSubmit={onSubmit}
        form={form}
        relays={getResponseRelays(formEvent)}
        formEvent={formEvent}
        formTemplate={formTemplate!}
      />
    );
  }

  if (!formTemplate) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Typography.Text style={{ fontSize: "16px" }}>
          This form is encrypted and requires access keys to view
        </Typography.Text>
        {!userPubKey && (
          <Button type="primary" onClick={requestPubkey}>
            Login to Access Form
          </Button>
        )}
      </div>
    );
  }

  return (
    <FormRenderer
      formTemplate={formTemplate}
      form={form}
      onInput={handleInput}
      footer={footer}
      hideTitleImage={hideTitleImage}
      hideDescription={hideDescription}
      formstrBranding={settings?.formstrBranding}
    />
  );
};
