import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { Button, Card, Typography } from "antd";
import { Event, getPublicKey, nip19 } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";
import { responsePath } from "../../../utils/formUtils";
import ReactMarkdown from "react-markdown";
import nip44 from "nostr-tools/nip44";
import { hexToBytes } from "@noble/hashes/utils";

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
      getPublicKey(hexToBytes(viewKey))
    );
    tags = JSON.parse(nip44.v2.decrypt(event.content, conversationKey));
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
    settings = JSON.parse(event.tags.filter((t) => t[0] === "settings")[0][1]);
  }

  return (
    <Card
      title={name[1] || "Hidden Form"}
      className="form-card"
      extra={
        onDeleted ? (
          <DeleteFormTrigger formKey={formKey} onDeleted={onDeleted} />
        ) : null
      }
    >
      <div
        style={{
          maxHeight: 100,
          textOverflow: "ellipsis",
          fontSize: 12,
          color: "grey",
          overflow: "clip",
          margin: 30,
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
        }}
      >
        Open Form
      </Button>
    </Card>
  );
};
