import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { Button, FormInstance, Dropdown, MenuProps } from "antd";
import React, { useState } from "react";
import { sendResponses } from "../../../nostr/common";
import { RelayPublishModal } from "../../../components/RelayPublishModal/RelaysPublishModal";
import { Event, generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { Response } from "../../../nostr/types";

interface SubmitButtonProps {
  selfSign: boolean | undefined;
  edit: boolean;
  form: FormInstance;
  formEvent: Event;
  onSubmit: (submittedAs: string, tempNsec: string) => Promise<void>;
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
    let submittedAsValue = '';
    let tempNsecValue = '';
    if (anonymous) {
      anonUser = generateSecretKey();
      const anonPubkey = getPublicKey(anonUser);
      submittedAsValue = nip19.npubEncode(anonPubkey);
      tempNsecValue = nip19.nsecEncode(anonUser);
    } else {
      if (!window.nostr) {
        console.error('NIP-07 extension not detected');
        return;
      }
      
      try {
        const userPubkey = await window.nostr.getPublicKey();
        if (!userPubkey) {
          console.error('No public key found');
          return;
        }
        
        submittedAsValue = nip19.npubEncode(userPubkey);

        const unsignedEvent = {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["r", formId]],
          content: "Form submission reference",
          pubkey: userPubkey
        };
        
        const signedEvent = await window.nostr.signEvent(unsignedEvent);
        
        tempNsecValue = signedEvent.sig;
      } catch (error) {
        console.error('Failed to sign event:', error);
        return;
      }
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
      onSubmit(submittedAsValue, tempNsecValue);
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
