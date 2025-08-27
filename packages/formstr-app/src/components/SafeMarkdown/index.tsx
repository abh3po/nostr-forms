// SafeMarkdown.tsx
import React from "react";
import ReactMarkdown, { Options } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// Custom schema to allow safe <span style="color:...">
const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "span"],
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ["style", /^color\s*:\s*#[0-9a-fA-F]{3,6}$/],
      // ✅ only allow hex colors for text
    ],
  },
};

export default function SafeMarkdown(props: Options) {
  return (
    <ReactMarkdown
      {...props}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, schema],
        ...(props.rehypePlugins || []), // preserve any caller plugins
      ]}
    />
  );
}
