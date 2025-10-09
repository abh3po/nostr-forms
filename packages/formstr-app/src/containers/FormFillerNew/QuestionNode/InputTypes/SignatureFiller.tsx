import { Button, Input, Typography, Collapse } from "antd";
import { useState } from "react";
import { IAnswerSettings } from "../../../CreateFormNew/components/AnswerSettings/types";
import { Field } from "../../../../nostr/types";
import { signerManager } from "../../../../signer";

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

  const handleSign = async () => {
    if (!window.nostr) {
      alert("Nostr signer not available");
      return;
    }

    const event = {
      kind: sig.kind || 0,
      created_at: Math.floor(Date.now() / 1000),
      content,
      tags: [],
    };

    try {
      setIsSigning(true);
      const signer = await signerManager.getSigner();
      const signed = await signer.signEvent(event);
      const signedString = JSON.stringify(signed, null, 2); // pretty-print for readability
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
