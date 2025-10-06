import { Divider, Input, Select, Switch, Typography } from "antd";
import { useState, useEffect } from "react";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { fetchNRPCMethods } from "../../../../../nostr/common";

const { Text } = Typography;

export default function Automations() {
  const { formSettings, relayList, updateFormSetting } =
    useFormBuilderContext();
  const [methods, setMethods] = useState<string[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Auto-fetch methods when npub changes
  useEffect(() => {
    const loadMethods = async () => {
      if (!formSettings.nrpcPubkey) return;
      setLoadingMethods(true);
      try {
        console.log("Server pubkey is", formSettings.nrpcPubkey);

        const result = await fetchNRPCMethods(
          relayList.map((url) => url.url),
          formSettings.nrpcPubkey
        );
        setMethods(result || []);
      } catch (err) {
        console.error("Failed to fetch NRPC methods", err);
      } finally {
        setLoadingMethods(false);
      }
    };
    loadMethods();
  }, [formSettings.nrpcPubkey, relayList]);

  return (
    <>
      <div
        className="property-setting"
        style={{ flexDirection: "column", gap: 8 }}
      >
        <Text className="property-text">NRPC Server Pubkey</Text>
        <Input
          placeholder="npub1..."
          value={formSettings.nrpcPubkey}
          onChange={(e) => updateFormSetting({ nrpcPubkey: e.target.value })}
          style={{ width: "100%" }}
        />
      </div>

      <div
        className="property-setting"
        style={{ flexDirection: "column", gap: 8, marginTop: 16 }}
      >
        <Text className="property-text">Method to Call</Text>
        <Select
          placeholder="Select method"
          value={formSettings.nrpcMethod}
          style={{ width: "100%" }}
          loading={loadingMethods}
          disabled={loadingMethods || methods.length === 0}
          options={methods.map((m) => ({ value: m, label: m }))}
          onChange={(val) => updateFormSetting({ nrpcMethod: val })}
        />
      </div>

      <div
        className="property-setting"
        style={{ flexDirection: "row", gap: 8, marginTop: 16 }}
      >
        <Text className="property-text">Require Webhook to Pass</Text>
        <Switch
          checked={formSettings.requireWebhookPass}
          onChange={(checked) =>
            updateFormSetting({ requireWebhookPass: checked })
          }
        />
      </div>

      <Text
        type="secondary"
        style={{ fontSize: 12, marginTop: 12, display: "block" }}
      >
        After form submission, Formstr will send an NRPC request to the
        configured server with the form responses.
        {formSettings.requireWebhookPass &&
          " Submissions will only be accepted if the server responds successfully."}
      </Text>

      <Divider className="divider" />
    </>
  );
}
