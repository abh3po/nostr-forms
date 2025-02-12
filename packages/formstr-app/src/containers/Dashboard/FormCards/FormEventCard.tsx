import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { Button, Card, Typography } from "antd";
import { Event, getPublicKey, nip19 } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";
import { responsePath } from "../../../utils/formUtils";
import ReactMarkdown from "react-markdown";
import nip44 from "nostr-tools/nip44";
import { EditOutlined } from "@ant-design/icons";

const { Text } = Typography;

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
  const publicForm = event.content === "";
  let tags: Tag[] = [];
  if (!publicForm && viewKey) {
    let conversationKey = nip44.v2.utils.getConversationKey(
      viewKey,
      event.pubkey
    );
    tags = [
      ...JSON.parse(nip44.v2.decrypt(event.content, conversationKey)),
      ...event.tags,
    ];
  } else {
    tags = event.tags;
  }
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
    settings = JSON.parse(tags.filter((t) => t[0] === "settings")[0][1]);
  }

  return (
    <Card
      title={name[1] || "Hidden Form"}
      className="form-card"
      extra={
        <div style={{ display: "flex", flexDirection: "row" }}>
          {secretKey ? (
            <EditOutlined
              style={{ color: "purple", marginBottom: 3 }}
              onClick={() => navigate(`/edit/${secretKey}/${formId}`)}
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
        Open Form
      </Button>
    </Card>
  );
};
