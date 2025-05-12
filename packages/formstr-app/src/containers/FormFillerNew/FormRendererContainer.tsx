import { Button, Form, Typography } from "antd";
import { Event } from "nostr-tools";
import { Response, Tag } from "../../nostr/types";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { getDefaultRelays } from "../../nostr/common";
import { SubmitButton } from "./SubmitButton/submit";
import { FormRenderer } from "./FormRenderer";
import { useEffect, useState } from "react";

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
}) => {
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [form] = Form.useForm();
  const { Text } = Typography;
  const [formTemplate, setFormTemplate] = useState<Tag[]>();

  useEffect(() => {
    const initialize = async () => {
      if (formEvent.content === "") {
        setFormTemplate(formEvent.tags);
        return;
      }
      const formSpec = await getFormSpec(
        formEvent,
        userPubKey,
        () => {},
        viewKey
      );
      if (formSpec) setFormTemplate(formSpec);
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

  const getResponseRelays = () => {
    let formRelays = formEvent.tags
      .filter((r) => r[0] === "relay")
      ?.map((r) => r[1]);
    if (formRelays.length === 0) formRelays = getDefaultRelays();
    return Array.from(new Set(formRelays));
  };

  const onSubmit = async () => {
    const formResponses = form.getFieldsValue(true);
    const responses: Response[] = Object.keys(formResponses).map((fieldId) => {
      let answer = null;
      let message = null;
      if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
      return ["response", fieldId, answer, JSON.stringify({ message })];
    });
    onSubmitClick(responses, formTemplate!);
  };

  const allowedUsers = getAllowedUsers(formEvent);
  let footer: React.ReactNode = null;

  if (allowedUsers.length === 0) {
    footer = (
      <SubmitButton
        selfSign={true}
        edit={false}
        onSubmit={onSubmit}
        form={form}
        relays={getResponseRelays()}
        formEvent={formEvent}
      />
    );
  } else if (!userPubKey) {
    footer = <Button onClick={requestPubkey}>Login to fill this form</Button>;
  } else if (!allowedUsers.includes(userPubKey)) {
    footer = <Text>You do not have permission to view this form</Text>;
  } else {
    footer = (
      <SubmitButton
        selfSign={true}
        edit={false}
        onSubmit={onSubmit}
        form={form}
        relays={getResponseRelays()}
        formEvent={formEvent}
      />
    );
  }
  if (!formTemplate)
    return <Typography.Text> Could not decipher form </Typography.Text>;
  return (
    <FormRenderer
      formTemplate={formTemplate}
      form={form}
      onInput={handleInput}
      footer={footer}
      hideTitleImage
      hideDescription
    />
  );
};
