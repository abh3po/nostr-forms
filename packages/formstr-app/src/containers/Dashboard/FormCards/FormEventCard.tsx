import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { Button, Card, Divider, message } from "antd";
import { Event } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";
import {
  editPath,
  getDecryptedForm,
  responsePath,
} from "../../../utils/formUtils";
import ReactMarkdown from "react-markdown";
import { DownloadOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface FormEventCardProps {
  event: Event;
  onDeleted?: () => void;
  relay?: string;
  secretKey?: string;
  viewKey?: string;
}
export const FormEventCard: React.FC<FormEventCardProps> = ({
  event,
  onDeleted,
  relay,
  secretKey,
  viewKey,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const publicForm = event.content === "";
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    const initialize = async () => {
      if (event.content === "") {
        setTags(event.tags);
        return;
      } else if (viewKey) {
        setTags(getDecryptedForm(event, viewKey));
      }
    };
    initialize();
  }, []);

  const name = event.tags.find((tag: Tag) => tag[0] === "name") || [];
  const pubKey = event.pubkey;
  const formId = event.tags.find((tag: Tag) => tag[0] === "d")?.[1];
  const relays = event.tags
    .filter((tag: Tag) => tag[0] === "relay")
    .map((t) => t[1]);

  if (!formId) {
    return <Card title="Invalid Form Event">{JSON.stringify(event)}</Card>;
  }
  const formKey = `${pubKey}:${formId}`;
  let settings: { description?: string } = {};
  if (publicForm || viewKey) {
    settings = JSON.parse(
      tags.filter((t) => t[0] === "settings")?.[0]?.[1] || "{}"
    );
  }

  const downloadForm = async (url: string) => {
    setLoading(true);
    try {
      // Get the form page HTML
      const formUrl = url.startsWith("/f/") 
      ? `${window.location.origin}${url}` 
      : `${window.location.origin}/form/${url}`;

      const response = await fetch(formUrl);
      let html = await response.text();
  
      // Parse the document
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // make base href to us current domain
      html = html.replace(
        /<base href=".*?\/>/,
        `<base href="${window.location.origin}/">`
      );

      // Inline  all scripts
      const scripts = Array.from(doc.querySelectorAll("script[src]"));
      await Promise.all(scripts.map(async (script) => {
        const src = script.getAttribute("src");
        if (!src) return;
        const absoluteSrc = src.startsWith("http") ? src : `${window.location.origin}${src}`;

        const res = await fetch(absoluteSrc);
        const content = await res.text();
        html = html.replace(script.outerHTML, `<script>${content}</script>`);
      }));

      // inline all styles
      const styles = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
      await Promise.all(styles.map(async (style) => {
        const href = style.getAttribute("href");
        if (!href) return;
        const absoluteHref = href.startsWith("http") 
        ? href 
        : `${window.location.origin}${href}`;

        const res = await fetch(absoluteHref);
        html = html.replace(
          style.outerHTML,
          `<style>${await res.text()}</style>`
        );
      }));

      // Force production paths for assets
      html = html.replace(
        /src="\/static\//g,
        `src="${window.location.origin}/static/`
      );

  
      // Get the hash path
      const hashRoute = url.startsWith("/f/") ? `#${url}` : `#/f/${url}`;

  
      // Inject the route forcing script early in the <head>
      const forceRouteScript = `
        <script>
          window.__FORCE_ROUTE__ = "${hashRoute.replace(/^#/, '')}";
          if (!window.location.hash || window.location.hash === "#/") {
            window.location.hash = "${hashRoute}";
          }
        </script>`;
  
      html = html.replace("<head>", `<head>${forceRouteScript}`);
  
      // Download the HTML file
      const blob = new Blob([html], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${name[1] || "form"}.html`;
      link.click();
  
      message.success("Form downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
      message.error("Failed to download form.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Card
      title={name[1] || "Hidden Form"}
      className="form-card"
      extra={
        <div style={{ display: "flex", flexDirection: "row" }}>
          {secretKey ? (
            <EditOutlined
              style={{ color: "purple", marginBottom: 3 }}
              onClick={() =>
                navigate(editPath(secretKey, formId, relay, viewKey))
              }
            />
          ) : null}
          {onDeleted ? (
            <DeleteFormTrigger formKey={formKey} onDeleted={onDeleted} />
          ) : null}
        </div>
      }
      style={{
        fontSize: 12,
        color: "grey",
        overflow: "clip",
      }}
    >
      <div
        style={{
          maxHeight: 100,
          textOverflow: "ellipsis",
          marginBottom: 30,
        }}
      >
        <ReactMarkdown>
          {settings.description
            ? settings.description?.trim().substring(0, 200) + "..."
            : "Encrypted Content"}
        </ReactMarkdown>
      </div>
      <Divider />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Button
            onClick={(e) => {
              secretKey
                ? navigate(responsePath(secretKey, formId, relay, viewKey))
                : navigate(`/r/${pubKey}/${formId}`);
            }}
            type="dashed"
            style={{
              color: "purple",
              borderColor: "purple",
            }}
          >
            View Responses
          </Button>
          <Button
            onClick={(e: any) => {
              e.stopPropagation();
              navigate(
          naddrUrl(
            pubKey,
            formId,
            relays.length ? relays : ["wss://relay.damus.io"],
            viewKey
          )
              );
            }}
            style={{
              marginLeft: "10px",
              color: "green",
              borderColor: "green",
            }}
            type="dashed"
          >
            Open Forms
          </Button>
          <Button
            onClick={(e: any) => {
              e.stopPropagation();
              downloadForm(
                naddrUrl(
                  pubKey,
                  formId,
                  relays.length ? relays : ["wss://relay.damus.io"],
                  viewKey
                )
              );
            }}
            icon ={<DownloadOutlined />}
            loading={loading}
            style={{
              marginLeft: "10px",
              color: "blue",
              borderColor: "blue",
            }}
            type="dashed"
          >
            Download Form
          </Button>
        </div>
        <div style={{ margin: 7 }}>
          {new Date(event.created_at * 1000).toDateString()}
        </div>
      </div>
    </Card>
  );
};
