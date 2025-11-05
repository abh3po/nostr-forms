import {
  Divider,
  Input,
  Select,
  Switch,
  Typography,
  message,
  Alert,
} from "antd";
import { useState, useEffect } from "react";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import {
  fetchNRPCMethods,
  fetchKind0Events,
} from "../../../../../nostr/common";
import { nip19 } from "nostr-tools";

const { Text } = Typography;

const npubToHex = (npub: string): string | null => {
  try {
    const { type, data } = nip19.decode(npub);
    return type === "npub" ? (data as string) : null;
  } catch {
    return null;
  }
};

const hexToNpub = (hex: string): string | null => {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return null;
  }
};

export default function Automations() {
  const { formSettings, relayList, updateFormSetting } =
    useFormBuilderContext();

  const [methods, setMethods] = useState<string[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [availableServers, setAvailableServers] = useState<
    { pubkey: string; name: string }[]
  >([]);
  const [loadingServers, setLoadingServers] = useState(false);
  const [introspectionError, setIntrospectionError] = useState<string | null>(
    null
  );

  // 🔹 Fetch list of NRPC servers (Kind 0 tagged as "nrpc_server")
  useEffect(() => {
    const loadServers = async () => {
      setLoadingServers(true);
      try {
        const events = await fetchKind0Events(
          relayList.map((r) => r.url),
          "nrpc_server",
          100
        );

        const parsed = events.map((ev: any) => {
          let meta;
          try {
            meta = JSON.parse(ev.content);
          } catch {
            meta = {};
          }
          return {
            pubkey: ev.pubkey,
            name: meta.name || meta.display_name || "Unnamed Server",
          };
        });

        setAvailableServers(parsed);
      } catch (err) {
        console.error("Failed to fetch NRPC servers", err);
        message.error("Failed to fetch available NRPC servers");
      } finally {
        setLoadingServers(false);
      }
    };

    loadServers();
  }, [relayList]);

  // 🔹 Auto-fetch NRPC methods when pubkey changes
  useEffect(() => {
    const loadMethods = async () => {
      if (!formSettings.nrpcPubkey) return;

      setLoadingMethods(true);
      setIntrospectionError(null);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Introspection timed out")), 10000)
      );

      try {
        const result = await Promise.race([
          fetchNRPCMethods(
            relayList.map((url) => url.url),
            formSettings.nrpcPubkey
          ),
          timeout,
        ]);

        if (!(result instanceof Array)) setMethods([]);
        setMethods(result as string[]);
      } catch (err: any) {
        console.error("Failed to fetch NRPC methods", err);
        const msg =
          err.message === "Introspection timed out"
            ? "The NRPC server did not respond within 10 seconds."
            : "Failed to fetch NRPC methods.";
        setIntrospectionError(msg);
        message.warning(msg);
      } finally {
        setLoadingMethods(false);
      }
    };

    loadMethods();
  }, [formSettings.nrpcPubkey, relayList]);

  return (
    <>
      {/* Select Existing Server */}
      <div
        className="property-setting"
        style={{ flexDirection: "column", gap: 8 }}
      >
        <Text className="property-text">Select an Existing NRPC Server</Text>
        <Select
          showSearch
          placeholder="Search or select NRPC server"
          optionFilterProp="label"
          loading={loadingServers}
          value={formSettings.nrpcPubkey || undefined}
          style={{ width: "100%" }}
          options={availableServers.map((s) => ({
            value: s.pubkey,
            label: s.name,
          }))}
          onChange={(val) => updateFormSetting({ nrpcPubkey: val })}
        />
      </div>

      {/* Manual Pubkey Input */}
      <Divider plain>Or enter custom NRPC pubkey</Divider>
      <div
        className="property-setting"
        style={{ flexDirection: "column", gap: 8 }}
      >
        <Text className="property-text">NRPC Server Pubkey</Text>
        <Input
          placeholder="npub1..."
          value={
            formSettings.nrpcPubkey
              ? (() => {
                  try {
                    return nip19.npubEncode(formSettings.nrpcPubkey);
                  } catch {
                    return "";
                  }
                })()
              : ""
          }
          onChange={(e) => {
            const val = e.target.value.trim();
            if (!val) {
              updateFormSetting({ nrpcPubkey: "" });
              return;
            }

            if (!val.startsWith("npub1")) {
              message.warning("Please enter a valid npub1 key");
              return;
            }

            try {
              const { type, data } = nip19.decode(val);
              if (type === "npub") {
                updateFormSetting({ nrpcPubkey: data as string });
              } else {
                message.warning("Invalid npub key format");
              }
            } catch {
              message.error("Could not decode npub key");
            }
          }}
          style={{ width: "100%" }}
        />
      </div>

      {/* Methods */}
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

      {/* Introspection Warning */}
      {introspectionError && (
        <Alert
          message={introspectionError}
          type="warning"
          showIcon
          style={{ marginTop: 12 }}
        />
      )}

      {/* Require Webhook */}
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
