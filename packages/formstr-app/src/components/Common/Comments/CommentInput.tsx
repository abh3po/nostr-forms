import React, { useState } from "react";
import { Input, Button } from "antd";

const { TextArea } = Input;

interface CommentInputProps {
  onSubmit: (content: string) => void;
  initialContent?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  initialContent = "",
}) => {
  const [newComment, setNewComment] = useState<string>(initialContent);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onSubmit(newComment);
      setNewComment("");
    }
  };

  return (
    <div style={{ margin: "10px 0" }}>
      <TextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment"
        autoSize={{ minRows: 2 }}
        style={{ marginBottom: 8 }}
      />
      <Button onClick={handleSubmit} type="primary">
        Submit Comment
      </Button>
    </div>
  );
};

export default CommentInput;