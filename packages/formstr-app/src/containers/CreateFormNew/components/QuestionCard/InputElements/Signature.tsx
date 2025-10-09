import React, { useState } from "react";
import { Input, Button, Typography, Space } from "antd";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";

const { Text, Paragraph } = Typography;

interface SignatureInputProps {
  answerSettings: AnswerSettings & {
    signature?: {
      kind?: number;
      editableContent?: boolean;
      prefilledContent?: string;
    };
  };
}

const SignatureInput: React.FC<SignatureInputProps> = ({ answerSettings }) => {
  const sig = answerSettings.signature ?? {};
  const [signedEvent, setSignedEvent] = useState<string>("");

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {sig.editableContent ? (
        // Case 1: Editable content
        <Input.TextArea
          value={sig.prefilledContent}
          placeholder="Edit content to sign"
          rows={4}
          disabled={true}
        />
      ) : sig.prefilledContent ? (
        // Case 2: Prefilled but not editable
        <Paragraph
          style={{
            backgroundColor: "#fafafa",
            border: "1px solid #e0e0e0",
            padding: "8px 12px",
            borderRadius: 6,
            whiteSpace: "pre-wrap",
          }}
        >
          {sig.prefilledContent}
        </Paragraph>
      ) : (
        // Case 3: No prefilled content and not editable
        <Text type="secondary">
          No content to sign. Please configure this field in the form builder.
        </Text>
      )}

      <Button type="primary" onClick={() => {}}>
        Sign
      </Button>

      {signedEvent && (
        <pre
          style={{
            background: "#f6f8fa",
            border: "1px solid #eaeaea",
            padding: "8px",
            borderRadius: "6px",
            overflowX: "auto",
          }}
        >
          {signedEvent}
        </pre>
      )}
    </Space>
  );
};

export default SignatureInput;
