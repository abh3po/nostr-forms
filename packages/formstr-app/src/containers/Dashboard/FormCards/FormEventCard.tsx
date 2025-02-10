import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { Button, Card, Typography } from "antd";
import { Event, nip19 } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";
import { responsePath } from "../../../utils/formUtils";

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
  const name = event.tags.find((tag: Tag) => tag[0] === "name") || [];
  const pubKey = event.pubkey;
  const formId = event.tags.find((tag: Tag) => tag[0] === "d")?.[1];
  const relays = event.tags
    .filter((tag: Tag) => tag[0] === "relay")
    .map((t) => t[1]);
  if (!formId) {
    return <Card title="Invalid Form Event">{JSON.stringify(event)}</Card>;
  }

  const publicForm = event.content === "";
  const formKey = `${pubKey}:${formId}`;

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
