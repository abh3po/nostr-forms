import { Button, Tooltip } from "antd";
import { CopyOutlined, LinkOutlined } from "@ant-design/icons";
import { useState } from "react";
import { isMobile } from "../../../../utils/utility";

export const UrlBox = ({
  label,
  url,
  showFullUrl = false,
  maxWidth = 400, // optional fixed width
}: {
  label: string;
  url: string;
  showFullUrl?: boolean;
  maxWidth?: number;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>{label}</div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Tooltip title={url}>
          <div
            style={{
              background: "#f5f5f5",
              padding: "8px 12px",
              borderRadius: 8,
              width: isMobile() ? 200 : 400,
              minWidth: 0, // ✅ lets flexbox shrink
              overflow: "hidden",
              whiteSpace: showFullUrl ? "normal" : "nowrap",
              textOverflow: showFullUrl ? "clip" : "ellipsis",
              flex: 1, // ✅ allow it to take remaining space, shrink if needed
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                paddingTop: 10,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: showFullUrl ? "clip" : "ellipsis",
                whiteSpace: showFullUrl ? "normal" : "nowrap",
              }}
            >
              {url}
            </a>
          </div>
        </Tooltip>

        {/* Buttons beside the URL box */}
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="Copy">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Open in new tab">
            <Button
              type="text"
              icon={<LinkOutlined />}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
            />
          </Tooltip>
        </div>
      </div>

      {copied && <div style={{ fontSize: 12, marginTop: 4 }}>Copied ✅</div>}
    </div>
  );
};
