import React from "react";
import { Avatar } from "antd";
import { useAppContext } from "../../hooks/useAppContext/useAppContext";
import { DEFAULT_IMAGE_URL } from "../../utils/constants";

interface OverlappingAvatarsProps {
  ids: string[];
  maxAvatars?: number;
}

const OverlappingAvatars: React.FC<OverlappingAvatarsProps> = ({
  ids,
  maxAvatars = 5,
}) => {
  let { profiles } = useAppContext();
  const visibleIds = ids.slice(0, maxAvatars);
  let additionalCount = ids.length - visibleIds.length;
  const excessIds = additionalCount > 0 ? additionalCount : 0;
  
  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        top: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: 48 + 24 * Math.min(maxAvatars, visibleIds.length),
      }}
    >
      {visibleIds.map((id, index) => (
        <Avatar
          key={id}
          style={{
            width: 24,
            height: 24,
            position: "absolute",
            left: `${index * 16}px`,
            zIndex: visibleIds.length - index,
            border: "1px solid #fff",
            margin: 0,
            padding: 0,
          }}
          src={profiles?.get(id)?.picture || DEFAULT_IMAGE_URL}
        />
      ))}
      {excessIds > 0 ? (
        <Avatar
          key="excess"
          style={{
            width: 24,
            height: 24,
            position: "absolute",
            left: `${Math.min(maxAvatars, visibleIds.length) * 18}px`,
            backgroundColor: "#FAD13F",
            color: "black",
            zIndex: 0,
            fontSize: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          +{excessIds}
        </Avatar>
      ) : null}
    </div>
  );
};

export default OverlappingAvatars;