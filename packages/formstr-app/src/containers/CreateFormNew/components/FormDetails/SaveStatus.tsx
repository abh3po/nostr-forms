import { Spin, Typography, Button } from "antd";

const { Text } = Typography;

export const SaveStatus = ({
  savedLocally,
  savedOnNostr,
  userPub,
  requestPubkey,
}: {
  savedLocally: boolean;
  savedOnNostr: null | "saving" | "saved";
  userPub: string | undefined;
  requestPubkey: () => void;
}) => {
  return (
    <div className="save-status">
      <div>Saved Locally? {savedLocally ? "✅" : "❌"}</div>
      {userPub ? (
        <div className="nostr-save-status">
          {savedOnNostr === "saving" ? (
            <div className="saving-indicator">
              <Text>Saving to nostr profile...</Text>
              <Spin size="small" style={{ marginLeft: 4 }} />
            </div>
          ) : (
            <div>
              Saved To Profile? {savedOnNostr === "saved" ? "✅" : "❌"}
            </div>
          )}
        </div>
      ) : (
        <div className="login-prompt">
          <Text>Login to save to your profile</Text>
          <Button onClick={requestPubkey} className="ml-2">
            Login
          </Button>
        </div>
      )}
    </div>
  );
};
