import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { Button, FormInstance, Dropdown, MenuProps } from "antd";
import React, { useState } from "react";
import { sendResponses } from "../../../nostr/common";
import { RelayPublishModal } from "../../../components/RelayPublishModal/RelaysPublishModal";
import { Event, generateSecretKey } from "nostr-tools";
import { Response } from "../../../nostr/types";

interface SubmitButtonProps {
  selfSign: boolean | undefined;
  edit: boolean;
  form: FormInstance;
  formEvent: Event;
  onSubmit: () => Promise<void>;
  disabled?: boolean;
  disabledMessage?: string;
  relays: string[];
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
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [acceptedRelays, setAcceptedRelays] = useState<string[]>([]);

  const saveResponse = async (anonymous: boolean = true) => {
    let formId = formEvent.tags.find((t) => t[0] === "d")?.[1];
    if (!formId) {
      alert("FORM ID NOT FOUND");
      return;
    }
    let pubKey = formEvent.pubkey;
    let formResponses = form.getFieldsValue(true);
    const responses: Response[] = Object.keys(formResponses).map(
      (fieldId: string) => {
        let answer = null;
        let message = null;
        if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
        return ["response", fieldId, answer, JSON.stringify({ message })];
      }
    );
    let anonUser = null;
    if (anonymous) {
      anonUser = generateSecretKey();
    }
    sendResponses(
      pubKey,
      formId,
      responses,
      anonUser,
      true,
      relays,
      (url: string) => setAcceptedRelays((prev) => [...prev, url])
    ).then((res: any) => {
      setIsSubmitting(false);
      onSubmit();
    });
  };

  const submitForm = async (anonymous: boolean = true) => {
    setIsSubmitting(true);
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
      <RelayPublishModal
        relays={relays}
        acceptedRelays={acceptedRelays}
        isOpen={isSubmitting}
      />
    </div>
  );
};
