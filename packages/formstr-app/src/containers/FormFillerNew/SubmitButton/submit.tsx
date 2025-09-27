import { LoadingOutlined, DownOutlined } from "@ant-design/icons";
import { Button, FormInstance, Dropdown, MenuProps } from "antd";
import React, { useState } from "react";
import { sendNRPCWebhook, sendResponses } from "../../../nostr/common";
import { RelayPublishModal } from "../../../components/RelayPublishModal/RelaysPublishModal";
import { Event, generateSecretKey } from "nostr-tools";
import { Response, Tag } from "../../../nostr/types";
import { pool } from "../../../pool";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { getFormSpec } from "../../../utils/formUtils";
import FormSettings from "../../CreateFormNew/components/FormSettings";
import { IFormSettings } from "../../CreateFormNew/components/FormSettings/types";

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

    let anonUser: Uint8Array | null = null;
    if (anonymous) {
      anonUser = generateSecretKey();
    }
    console.log("Calling nrpc webhook");

    // 🔹 Try sending NRPC webhook first
    const nrpcEvent = await sendNRPCWebhook(
      formTemplate,
      responses,
      anonUser || undefined
    );

    console.log("NRPC EVENT IS", nrpcEvent, JSON.stringify(nrpcEvent));

    if (!nrpcEvent) {
      // no NRPC configured → proceed normally
      setIsSubmitting(true);
      await sendResponses(
        pubKey,
        formId,
        responses,
        anonUser,
        true,
        relays,
        (url: string) => setAcceptedRelays((prev) => [...prev, url])
      );
      setIsSubmitting(false);
      onSubmit();
      return;
    }

    // 🔹 If NRPC exists, wait for response

    return new Promise<void>((resolve, reject) => {
      const relays = formEvent.tags
        .filter((value: Tag) => value[0] === "relay")
        .map((t) => t[1]);
      console.log("Webhook listening for", nrpcEvent.id, "on relays", relays);
      const sub = pool.subscribeMany(
        relays,
        [
          {
            "#e": [nrpcEvent.id],
          },
        ],
        {
          onevent: (ev: Event) => {
            const status = ev.tags.find((t) => t[0] === "status")?.[1];
            console.log("GOT EVENT", ev);
            if (!status) return;

            if (parseInt(status) >= 400) {
              const errorTag = ev.tags.find((t) => t[0] === "error");
              const msg = errorTag?.[2] || "Unknown NRPC error";

              // 🔹 Show NRPC error as global form error
              form.setFields([
                {
                  name: "global",
                  errors: [msg],
                },
              ]);
              setIsSubmitting(false);
              setIsDisabled(false);
              sub.close();
              reject(new Error(msg));
              return;
            }
            setIsSubmitting(true);
            // ✅ Success → now call sendResponses
            sub.close();
            sendResponses(
              pubKey,
              formId!,
              responses,
              anonUser,
              true,
              relays,
              (url: string) => setAcceptedRelays((prev) => [...prev, url])
            ).then(() => {
              setIsSubmitting(false);
              onSubmit();
              resolve();
            });
          },
        }
      );
    });
  };

  const submitForm = async (anonymous: boolean = true) => {
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
      <RelayPublishModal
        relays={relays}
        acceptedRelays={acceptedRelays}
        isOpen={isSubmitting}
      />
    </div>
  );
};
