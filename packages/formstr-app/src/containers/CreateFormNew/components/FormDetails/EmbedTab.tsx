// EmbedTab.tsx
import { Checkbox } from "antd";
import { useState } from "react";
import { CopyButton } from "../../../../components/CopyButton";
import { constructEmbeddedUrl } from "../../../../utils/formUtils";

export const EmbedTab = ({
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
  const [embedOptions, setEmbedOptions] = useState<{
    hideTitleImage?: boolean;
    hideDescription?: boolean;
  }>({});

  const toggleOption = (key: "hideTitleImage" | "hideDescription") =>
    setEmbedOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const iframeHtml = `<iframe src="${constructEmbeddedUrl(
    pubKey,
    formId,
    embedOptions,
    relays,
    viewKey
  )}" height="700px" width="480px" frameborder="0" style="border-style:none;box-shadow:0px 0px 2px 2px rgba(0,0,0,0.2);" cellspacing="0" ></iframe>`;

  return (
    <div className="embedded-share">
      <div className="settings-container">
        <Checkbox
          checked={embedOptions.hideTitleImage}
          onChange={() => toggleOption("hideTitleImage")}
        >
          Hide Title Image
        </Checkbox>
        <Checkbox
          checked={embedOptions.hideDescription}
          onChange={() => toggleOption("hideDescription")}
        >
          Hide Description
        </Checkbox>
      </div>

      <div className="embed-container">
        <code className="embedded-code">{iframeHtml}</code>
        <CopyButton getText={() => iframeHtml} textBefore="" textAfter="" />
      </div>
    </div>
  );
};
