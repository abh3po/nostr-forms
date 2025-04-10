import { Button, Divider, Input, Typography, message, Tabs } from "antd";
import AddNpubStyle from "../addNpub.style";
import { ReactNode, useState } from "react";
import { isValidNpub, isValidNip05Format, resolveNip05, isValidIdentifier } from "./utils";
import { nip19 } from "nostr-tools";
import { CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import UserSearch from "./UserSearch";

const { TabPane } = Tabs;

interface NpubListProps {
  NpubList: Set<string> | null;
  setNpubList: (npubs: Set<string>) => void;
  ListHeader: string;
  relays?: string[];
}

export const NpubList: React.FC<NpubListProps> = ({
  setNpubList,
  NpubList,
  ListHeader,
  relays = ["wss://relay.nostr.band"], // Relays supporting Nip50 search
}) => {
  const [newIdentifier, setNewIdentifier] = useState<string>("");
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const removeParticipant = (participant: string) => {
    const updatedList = new Set(NpubList);
    updatedList.delete(participant);
    setNpubList(updatedList);
  };

  const renderList = () => {
    const elements: ReactNode[] = [];
    (NpubList || new Set()).forEach(
      (value: string, key: string, set: Set<string>) => {
        elements.push(
          <li key={value}>
            <Typography.Text>
              {nip19.npubEncode(value).substring(0, 10) + "..."}
            </Typography.Text>
            <Button
              type="link"
              icon={<CloseCircleOutlined />}
              onClick={() => removeParticipant(value)}
              style={{ marginLeft: "10px" }}
            />
          </li>
        );
      }
    );
    return <ul>{elements}</ul>;
  };

  const handleAddIdentifier = async () => {
    if (!newIdentifier) return;

    if (isValidNpub(newIdentifier)) {
      // Handle npub
      const pubkey = nip19.decode(newIdentifier).data as string;
      setNpubList(new Set(NpubList).add(pubkey));
      setNewIdentifier("");
    } else if (isValidNip05Format(newIdentifier)) {
      // Handle NIP-05
      setIsResolving(true);
      try {
        const pubkey = await resolveNip05(newIdentifier);
        if (pubkey) {
          setNpubList(new Set(NpubList).add(pubkey));
          setNewIdentifier("");
        } else {
          message.error("Could not resolve NIP-05 identifier");
        }
      } catch (error) {
        message.error("Error resolving NIP-05 identifier");
      }
      setIsResolving(false);
    }
  };

  const handleAddUserFromSearch = (pubkey: string) => {
    setNpubList(new Set(NpubList).add(pubkey));
    message.success("User added successfully");
  };

  return (
    <div>
      <AddNpubStyle className="modal-container">
        <Typography.Text
          style={{
            fontSize: 18,
          }}
        >
          {ListHeader}
        </Typography.Text>
        <Divider />
        {renderList()}

        <Tabs defaultActiveKey="direct">
          <TabPane tab="Direct Input" key="direct">
            <Input
              placeholder="Enter npub or NIP-05 identifier (name@domain.com)"
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              className="npub-input"
            />
            {newIdentifier && !isValidIdentifier(newIdentifier) && (
              <div>
                <Typography.Text className="error-npub">
                  Not a valid npub or NIP-05 identifier
                </Typography.Text>
              </div>
            )}
            <Button
              type="primary"
              className="add-button"
              disabled={!isValidIdentifier(newIdentifier) || isResolving}
              onClick={handleAddIdentifier}
            >
              {isResolving ? <LoadingOutlined /> : "Add"}
            </Button>
          </TabPane>

          <TabPane tab="Search Users" key="search">
            <UserSearch onSelectUser={handleAddUserFromSearch} relays={relays} />
          </TabPane>
        </Tabs>
      </AddNpubStyle>
    </div>
  );
};