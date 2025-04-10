import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, Tooltip, Typography } from "antd";
import { CommentOutlined } from "@ant-design/icons";
import { useAppContext } from "../../../hooks/useAppContext/useAppContext";
import { signEvent } from "../../../nostr/poll";
import { pollRelays } from "../../../nostr/common";
import { Event, nip19 } from "nostr-tools";
import { DEFAULT_IMAGE_URL } from "../../../utils/constants";
import { SubCloser } from "nostr-tools";
import { useUserContext } from "../../../hooks/useUserContext";
import { TextWithImages } from "../TextWithImages";
import { calculateTimeAgo } from "../../../utils/common";
import CommentInput from "../Comments/CommentInput";

const { Meta } = Card;
const { Text } = Typography;

interface PollCommentsProps {
  pollEventId: string;
}

const PollComments: React.FC<PollCommentsProps> = ({ pollEventId }) => {
  const [showComments, setShowComments] = useState<boolean>(false);
  const {
    poolRef,
    profiles,
    fetchUserProfileThrottled,
    fetchCommentsThrottled,
    commentsMap,
    addEventToMap,
  } = useAppContext();

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Map<string, boolean>>(
    new Map()
  );

  const { user } = useUserContext();

  const fetchComments = () => {
    let filter = {
      kinds: [1],
      "#e": [pollEventId],
    };
    let closer = poolRef.current.subscribeMany(pollRelays, [filter], {
      onevent: addEventToMap,
    });
    return closer;
  };

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (!closer && showComments) {
      closer = fetchComments();
      return () => {
        if (closer) closer.close();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  useEffect(() => {
    if (!commentsMap?.get(pollEventId)) {
      fetchCommentsThrottled(pollEventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!user) {
      alert("Login To Comment");
      return;
    }

    const commentEvent = {
      kind: 1,
      content: content,
      tags: [
        ["e", pollEventId, "", "root"],
        ...(parentId ? [["e", parentId, "", "reply"]] : []),
      ],
      created_at: Math.floor(Date.now() / 1000),
    };
    let finalEvent;
    const signedComment = await signEvent(commentEvent, user.privateKey);
    if (signedComment) {
      finalEvent = {
        ...signedComment,
        pubkey: user.pubkey
      };
    }
    poolRef.current.publish(pollRelays, finalEvent!);
    setReplyTo(null);
  };

  const renderComments = (comments: Event[], parentId: string | null) => {
    return comments
      .filter((comment) => {
        const isReplyTo = comment.tags.filter(
          (tag) => tag[3] === "reply"
        )?.[0]?.[1];

        if (parentId === null) {
          return !isReplyTo || replyTo === pollEventId;
        }

        // If parentId is specified, we want replies to that parentId
        return comment.tags.some(
          (tag) => tag[1] === parentId && tag[3] === "reply"
        );
      })
      .map((comment) => {
        const commentUser = profiles?.get(comment.pubkey);
        if (!commentUser) fetchUserProfileThrottled(comment.pubkey); // Fetch user profile if not found

        const hasReplies = comments.some((c) =>
          c.tags.some((tag) => tag[3] === "reply" && tag[1] === comment.id)
        );

        return (
          <div key={comment.id} style={{ marginLeft: "20px" }}>
            <Card 
              style={{ marginTop: 10, width: "100%" }}
              actions={[
                <div key="comment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CommentOutlined 
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplyTo(replyTo === comment.id ? null : comment.id);
                    }} 
                  />
                </div>,
                hasReplies && (
                  <Button
                    key="replies"
                    type="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReplies((prev) => {
                        const updated = new Map(prev);
                        updated.set(comment.id, !prev.get(comment.id));
                        return updated;
                      });
                    }}
                  >
                    {showReplies.get(comment.id)
                      ? "Hide Replies"
                      : "Show Replies"}
                  </Button>
                )
              ].filter(Boolean)}
            >
              <Meta
                avatar={<Avatar src={commentUser?.picture || DEFAULT_IMAGE_URL} />}
                title={
                  profiles?.get(comment.pubkey)?.name ||
                  nip19.npubEncode(comment.pubkey).substring(0, 10) + "..."
                }
                description={calculateTimeAgo(comment.created_at)}
              />
              <div style={{ marginTop: 16 }}>
                <Text>
                  <TextWithImages content={comment.content} />
                </Text>
              </div>
            </Card>

            {/* Render reply input only if this comment is selected for replying */}
            {replyTo === comment.id && (
              <CommentInput
                onSubmit={(content) => {
                  handleSubmitComment(content, comment.id);
                  setReplyTo(null); // Reset replyTo after submitting
                }}
              />
            )}
            
            {/* Render child comments if visible */}
            {showReplies.get(comment.id) &&
              renderComments(comments, comment.id)}
          </div>
        );
      });
  };
  
  const comments = commentsMap?.get(pollEventId) || [];
  const localCommentsMap = new Map((comments || []).map((c) => [c.id, c]));

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <Tooltip title={showComments ? "Hide Comments" : "View Comments"}>
        <span
          onClick={() => setShowComments(!showComments)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <CommentOutlined style={{ marginRight: 4 }} />
          <Text>{comments.length ? comments.length : null}</Text>
        </span>
      </Tooltip>
      
      {showComments && (
        <div>
          <CommentInput onSubmit={(content) => handleSubmitComment(content)} />
          <div>
            <Typography.Title level={5}>
              {comments.length === 0 ? "No Comments" : "Comments"}
            </Typography.Title>
            {renderComments(Array.from(localCommentsMap.values()), null)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollComments;