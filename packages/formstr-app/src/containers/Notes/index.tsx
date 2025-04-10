import React, { useEffect } from "react";
import { Avatar, Card, Typography, Space, Divider } from "antd";
import { CommentOutlined, HeartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Event, nip19 } from "nostr-tools";
import { TextWithImages } from "../../components/Common/TextWithImages";
import { useAppContext } from "../../hooks/useAppContext/useAppContext";
import { DEFAULT_IMAGE_URL } from "../../utils/constants";
import { openProfileTab } from "../../nostr/poll";
import PollComments from "../../components/Common/Comments/PollComments";
import Likes from "../../components/Common/Likes/likes";
import Zap from "../../components/Common/Zaps/zaps";
import { calculateTimeAgo } from "../../utils/common";
import { PrepareNote } from "./PrepareNote";

const { Text, Title } = Typography;
const { Meta } = Card;

interface NotesProps {
  event: Event;
}

export const Notes: React.FC<NotesProps> = ({ event }) => {
  const { profiles, fetchUserProfileThrottled } = useAppContext();
  const referencedEventId = event.tags.find((t) => t[0] === "e")?.[1];

  useEffect(() => {
    if (!profiles?.has(event.pubkey)) {
      fetchUserProfileThrottled(event.pubkey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeAgo = calculateTimeAgo(event.created_at);

  const displayName =
    profiles?.get(event.pubkey)?.name ||
    profiles?.get(event.pubkey)?.username ||
    profiles?.get(event.pubkey)?.nip05 ||
    nip19.npubEncode(event.pubkey).slice(0, 10) + "...";

  const handleAvatarClick = () => {
    openProfileTab(nip19.npubEncode(event.pubkey));
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px" }}>
        <Avatar 
          src={profiles?.get(event.pubkey)?.picture || DEFAULT_IMAGE_URL} 
          size={40}
          style={{ cursor: "pointer" }}
          onClick={handleAvatarClick}
        />
        <div style={{ marginLeft: 10 }}>
          <Text strong style={{ fontSize: 16 }}>{displayName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{timeAgo}</Text>
        </div>
      </div>

      <Card 
        type="inner" 
        style={{ margin: "0 10px 10px 10px" }}
      >
        {referencedEventId && (
          <div style={{ marginBottom: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>replying to:</Text>
            <PrepareNote eventId={referencedEventId} />
          </div>
        )}
        <div style={{ padding: "5px 0" }}>
          <TextWithImages content={event.content} />
        </div>
      </Card>

      <div style={{ 
        display: "flex", 
        padding: "0 10px 10px 10px",
        alignItems: "center"
      }}>
        <PollComments pollEventId={event.id} />
        <Likes pollEvent={event} />
        <Zap pollEvent={event} />
      </div>
    </Card>
  );
};