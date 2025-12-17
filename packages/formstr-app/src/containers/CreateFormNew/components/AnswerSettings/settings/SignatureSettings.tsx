import { Input, InputNumber, Switch, Typography, Space } from "antd";
import React from "react";
import { IAnswerSettings } from "../types";

const { Text } = Typography;

interface SignatureSettingsProps {
  answerSettings: IAnswerSettings;
  handleAnswerSettings: (settings: IAnswerSettings) => void;
}

export const SignatureSettings: React.FC<SignatureSettingsProps> = ({
  answerSettings,
  handleAnswerSettings,
}) => {
  const sig = answerSettings.signature || {};

  const updateSignature = (key: string, value: any) => {
    handleAnswerSettings({
      ...answerSettings,
      signature: { ...sig, [key]: value },
    });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div className="property-setting">
        <Text className="property-name">Event Kind</Text>
        <InputNumber
          min={0}
          value={sig.kind === 0 ? 0 : sig.kind || 22157}
          onChange={(v) => updateSignature("kind", v)}
        />
      </div>

      <div className="property-setting">
        <Text className="property-name">Editable Content</Text>
        <Switch
          checked={sig.editableContent}
          onChange={(v) => updateSignature("editableContent", v)}
        />
      </div>

      <div className="property-setting">
        <Text className="property-name">Prefilled Content</Text>
        <Input.TextArea
          rows={3}
          value={sig.prefilledContent}
          onChange={(e) => updateSignature("prefilledContent", e.target.value)}
          placeholder="Default content to sign"
        />
      </div>
      <div className="property-setting">
        <Text className="property-name">Editable Created At</Text>
        <Switch
          checked={sig.editableCreatedAt}
          onChange={(v) => updateSignature("editableCreatedAt", v)}
        />
      </div>
    </Space>
  );
};
