import React, { useEffect } from "react";
import { Tooltip, Typography } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useAppContext } from "../../../hooks/useAppContext/useAppContext";
import { Event, EventTemplate } from "nostr-tools";
import { signEvent } from "../../../nostr/poll";
import { pollRelays } from "../../../nostr/common";
import { useUserContext } from "../../../hooks/useUserContext";

interface LikesProps {
  pollEvent: Event;
}

const Likes: React.FC<LikesProps> = ({ pollEvent }) => {
  const { likesMap, fetchLikesThrottled, poolRef, addEventToMap } =
    useAppContext();
  const { user } = useUserContext();

  const addLike = async () => {
    if (!user) {
      alert("Login To Like!");
      return;
    }
    let event: EventTemplate = {
      content: "+",
      kind: 7,
      tags: [["e", pollEvent.id, pollRelays[0]]],
      created_at: Math.floor(Date.now() / 1000),
    };
    
    let signedEvent = await signEvent(event, user.privateKey);
    let finalEvent;
    if (signedEvent) {
      const finalEvent: Event = {
        ...signedEvent,
        pubkey: user.pubkey
      };
    }
    poolRef.current.publish(pollRelays, finalEvent!);
    addEventToMap(finalEvent!);
  };

  const hasLiked = () => {
    if (!user) return false;
    return !!likesMap
      ?.get(pollEvent.id)
      ?.map((e) => e.pubkey)
      ?.includes(user.pubkey);
  };

  useEffect(() => {
    const fetchAndSetLikes = async () => {
      if (!likesMap?.get(pollEvent.id)) fetchLikesThrottled(pollEvent.id);
    };

    fetchAndSetLikes();
  }, [pollEvent.id, likesMap, fetchLikesThrottled, user]);

  const handleLike = async () => {
    if (!window.nostr) {
      alert("Nostr Signer Extension Is Required.");
      return;
    }
    if (hasLiked()) {
      //await removeLike(pollEvent.id, userPublicKey);
      //setLikes((prevLikes) => prevLikes.filter((like) => like !== userPublicKey));
    } else {
      await addLike();
    }
  };

  const likeCount = likesMap?.get(pollEvent.id)?.length
    ? new Set(likesMap?.get(pollEvent.id)?.map((like) => like.pubkey)).size
    : null;

  return (
    <div style={{ marginLeft: 20 }}>
      <Tooltip title={hasLiked() ? "Unlike" : "Like"}>
        <span
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={handleLike}
        >
          {hasLiked() ? (
            <HeartFilled style={{ color: "#FAD13F", fontSize: 16 }} />
          ) : (
            <HeartOutlined style={{ fontSize: 16 }} />
          )}
          <Typography style={{ marginLeft: 4 }}>
            {likeCount}
          </Typography>
        </span>
      </Tooltip>
    </div>
  );
};

export default Likes;