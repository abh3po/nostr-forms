import { Alert, Typography } from "antd";
import { CopyButton } from "../../../../components/CopyButton";
import { makeFormNAddr } from "../../../../utils/utility";

const { Paragraph, Text } = Typography;

export const EmbedWithSDKTab = ({
  pubKey,
  formId,
  relays,
  viewKey,
}: {
  pubKey: string;
  formId: string;
  relays: string[];
  viewKey?: string;
}) => {
  console.log("pubkey", pubKey, viewKey);
  const naddr = makeFormNAddr(pubKey, formId, relays);
  const isPrivate = Boolean(viewKey);

  const sdkSnippet = isPrivate
    ? `<!-- Container -->
<div id="formstr-container"></div>

<script src="https://unpkg.com/formstr-sdk/dist/formstr.bundle.js"></script>
<script>
  const sdk = new FormstrSDK.FormstrSDK();

  async function mountForm() {
    const naddr = "${naddr}";
    const viewKey = "${viewKey}";

    const form = await sdk.fetchFormWithViewKey(naddr, viewKey);
    sdk.renderHtml(form);

    document.getElementById("formstr-container").innerHTML =
      form.html.form;

    sdk.attachSubmitListener(form);
  }

  mountForm();
</script>`
    : `<!-- Container -->
<div id="formstr-container"></div>

<script src="https://unpkg.com/formstr-sdk/dist/formstr.bundle.js"></script>
<script>
  const sdk = new FormstrSDK.FormstrSDK();

  async function mountForm() {
    const naddr = "${naddr}";

    const form = await sdk.fetchForm(naddr);
    sdk.renderHtml(form);

    document.getElementById("formstr-container").innerHTML =
      form.html.form;

    sdk.attachSubmitListener(form);
  }

  mountForm();
</script>`;

  return (
    <div className="sdk-embed">
      <Alert
        type="info"
        showIcon
        message="Embed using Formstr SDK"
        description={
          isPrivate
            ? "This form is private. A viewKey is required to fetch it."
            : "This is a public form. No keys are required."
        }
        style={{ marginBottom: 16 }}
      />

      <Paragraph>
        <Text strong>Required:</Text>
        <br />
        <Text code>naddr</Text>
        {isPrivate && (
          <>
            <br />
            <Text code>viewKey</Text>
          </>
        )}
      </Paragraph>

      <Paragraph>
        <Text strong>Styling & customization</Text>
        <br />
        The SDK renders neutral HTML. You control layout and appearance via CSS.
        Copy the default Formstr theme as a starting point or style it from
        scratch.
      </Paragraph>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 420,
          overflow: "auto",
          background: "#0f172a",
          color: "#e5e7eb",
          padding: "1rem",
          borderRadius: 8,
        }}
      >
        {sdkSnippet}
      </pre>

      <CopyButton getText={() => sdkSnippet} textBefore="" textAfter="" />
    </div>
  );
};
