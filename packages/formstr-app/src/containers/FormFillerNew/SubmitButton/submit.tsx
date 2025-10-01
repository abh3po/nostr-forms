import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { Button, FormInstance, Dropdown, MenuProps } from "antd";
import React, { useState } from "react";
import { sendNRPCWebhook, sendResponses } from "../../../nostr/common";
import { RelayPublishModal } from "../../../components/RelayPublishModal/RelaysPublishModal";
import { Event, EventTemplate, generateSecretKey } from "nostr-tools";
import { Response, Tag } from "../../../nostr/types";
import { pool } from "../../../pool";
import { getFormSettings } from "./utils";

interface SubmitButtonProps {
  selfSign: boolean | undefined;
  edit: boolean;
  form: FormInstance;
  formEvent: Event;
  onSubmit: () => Promise<void>;
  disabled?: boolean;
  disabledMessage?: string;
  relays: string[];
  formTemplate: Tag[];
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  selfSign,
  edit,
  form,
  onSubmit,
  formEvent,
  disabled = false,
  disabledMessage = "disabled",
  relays,
  formTemplate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [acceptedRelays, setAcceptedRelays] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Helpers ---
  const buildResponses = (form: FormInstance): Response[] => {
    const formResponses = form.getFieldsValue(true);
    return Object.keys(formResponses).map((fieldId: string) => {
      let answer = null;
      let message = null;
      if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
      return ["response", fieldId, answer, JSON.stringify({ message })];
    });
  };

  const fireWebhook = async (
    formTemplate: Tag[],
    responses: Response[],
    anonUser?: Uint8Array
  ) => {
    const relays = formEvent.tags
      .filter((value: Tag) => value[0] === "relay")
      .map((t) => t[1]);
    return await sendNRPCWebhook(formTemplate, responses, relays, anonUser);
  };
  // --- Main ---
  const saveResponse = async (anonymous: boolean) => {
    let formId = formEvent.tags.find((t) => t[0] === "d")?.[1];
    if (!formId) {
      alert("FORM ID NOT FOUND");
      return;
    }

    const pubKey = formEvent.pubkey;
    const responses = buildResponses(form);
    const anonUser = anonymous ? generateSecretKey() : null;

    const settings = getFormSettings(formTemplate);
    const requireWebhookPass = settings?.requireWebhookPass ?? false;

    const sendAllResponses = async () => {
      setIsSubmitting(true);
      await sendResponses(
        pubKey,
        formId!,
        responses,
        anonUser,
        true,
        relays,
        (url: string) => setAcceptedRelays((prev) => [...prev, url])
      );
      setIsSubmitting(false);
      onSubmit();
    };

    if (!requireWebhookPass) {
      // fire-and-forget
      console.log("Webhook fired (fire-and-forget)");
      await sendAllResponses();
      fireWebhook(formTemplate, responses, anonUser || undefined);
      return;
    }

    const nrpcResponse = await fireWebhook(
      formTemplate,
      responses,
      anonUser || undefined
    );
    let result = processNRPCResponse(nrpcResponse);
    if (result) await sendAllResponses();
  };

  const processNRPCResponse = (nrpcResponse?: EventTemplate) => {
    if (!nrpcResponse) {
      setErrorMessage("No Message ");
      setIsSubmitting(false);
      setIsDisabled(false);
      return false;
    }
    const status = nrpcResponse.tags.find((t) => t[0] === "status")?.[1];
    if (!status) return true;

    if (parseInt(status) >= 400) {
      const errorTags = nrpcResponse.tags.filter((t) => t[0] === "error");
      const msg =
        errorTags.map((tag: string[]) => tag[2]).join(",") ||
        "Unknown NRPC error";
      setErrorMessage(msg);
      setIsSubmitting(false);
      setIsDisabled(false);
      return false;
    }
    return true;
  };

  const submitForm = async (anonymous: boolean = true) => {
    setErrorMessage(null);
    try {
      await form.validateFields();
      let errors = form.getFieldsError().filter((e) => e.errors.length > 0);
      if (errors.length === 0) {
        setIsDisabled(true);
        await saveResponse(anonymous);
      }
    } catch (err) {
      setIsSubmitting(false);
      setIsDisabled(false);
      console.log("Error in sending response", err);
    }
  };

  const handleMenuClick: MenuProps["onClick"] = async (e) => {
    if (e.key === "signSubmition") {
      await submitForm(false);
    } else {
      await submitForm(true);
    }
  };

  const handleButtonClick = async () => {
    await submitForm(!selfSign);
  };

  const items = [
    {
      label: "Submit Anonymously",
      key: "submit",
      disabled: selfSign,
    },
    {
      label: edit ? "Update Response" : "Submit As Yourself",
      key: "signSubmition",
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <div>
      <Dropdown.Button
        menu={menuProps}
        type="primary"
        onClick={handleButtonClick}
        icon={<DownOutlined />}
        disabled={isDisabled}
        className="submit-button"
        data-testid="submit-button"
      >
        {disabled ? (
          disabledMessage
        ) : isSubmitting ? (
          <span>
            <LoadingOutlined className="mr-2" />
            Submitting...
          </span>
        ) : selfSign ? (
          items[1].label
        ) : (
          "Submit"
        )}
      </Dropdown.Button>
      {errorMessage && (
        <div
          style={{ color: "red", marginTop: 8 }}
          className="submit-button"
          data-testid="submit-error"
        >
          Error: {errorMessage}
        </div>
      )}
      <RelayPublishModal
        relays={relays}
        acceptedRelays={acceptedRelays}
        isOpen={isSubmitting}
      />
    </div>
  );
};
