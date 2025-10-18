import { Button, Input, Typography, Collapse } from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { IAnswerSettings } from "../../../CreateFormNew/components/AnswerSettings/types";
import { Field } from "../../../../nostr/types";
import { signerManager } from "../../../../signer";
import { DatePicker } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

interface SignatureFillerProps {
  fieldConfig: IAnswerSettings;
  onChange: (value: string, displayValue?: string) => void;
  field?: Field;
  disabled?: boolean;
}

export const SignatureFiller: React.FC<SignatureFillerProps> = ({
  fieldConfig,
  onChange,
  disabled,
}) => {
  const sig = fieldConfig.signature || {};
  const [content, setContent] = useState(sig.prefilledContent || "");
  const [signedEvent, setSignedEvent] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // For editable created_at
  const initialCreatedAt = dayjs(Date.now());
  const [createdAt, setCreatedAt] = useState<Dayjs>(initialCreatedAt);

  const handleSign = async () => {
    const event = {
      kind: sig.kind || 22157,
      created_at: sig.editableCreatedAt
        ? Math.floor(createdAt.valueOf() / 1000)
        : Math.floor(Date.now() / 1000),
      content,
      tags: [],
    };

    try {
      setIsSigning(true);
      const signer = await signerManager.getSigner();
      const signed = await signer.signEvent(event);
      const signedString = JSON.stringify(signed, null, 2);
      setSignedEvent(signedString);
      onChange(signedString, "Signed nostr event");
    } catch (e) {
      console.error(e);
      alert("Signature failed");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div style={{ height: "auto" }}>
      <TextArea
        value={content}
        disabled={disabled || !sig.editableContent}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <div style={{ display: "flex" }}>
        <Text style={{ margin: 10 }}> Signature Date: </Text>
        {sig.editableCreatedAt && (
          <DatePicker
            value={createdAt}
            onChange={(date) => date && setCreatedAt(date)}
            showTime
            style={{ marginBottom: 8, width: "auto" }}
            disabled={disabled}
            placeholder="Pick Date & Time"
          />
        )}
      </div>
      <Button
        type="primary"
        loading={isSigning}
        onClick={handleSign}
        disabled={disabled}
        style={{ marginTop: 8 }}
      >
        {isSigning ? "Signing..." : "Attach Signature"}
      </Button>

      {signedEvent && (
        <Collapse
          ghost
          style={{ marginTop: 12 }}
          items={[
            {
              key: "1",
              label: <Text strong>View Signed Event</Text>,
              children: (
                <TextArea
                  value={signedEvent}
                  autoSize={{ minRows: 6, maxRows: 12 }}
                  readOnly
                  style={{
                    fontFamily: "monospace",
                    background: "#fafafa",
                    borderRadius: 4,
                  }}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};
