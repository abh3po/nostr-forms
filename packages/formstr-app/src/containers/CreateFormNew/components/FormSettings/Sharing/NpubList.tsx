import { Button, Divider, Input, Typography, message, List, Avatar } from "antd";
import AddNpubStyle from "../addNpub.style";
import { ReactNode, useState, useRef} from "react";
import { isValidNpub, isValidNip05Format, resolveNip05, isValidIdentifier, performNip50Search } from "./utils";
import { nip19 } from "nostr-tools";
import { CloseCircleOutlined, LoadingOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";

interface NpubListProps {
  NpubList: Set<string> | null;
  setNpubList: (npubs: Set<string>) => void;
  ListHeader: string;
  relays?: string[];
}

interface UserResult {
  pubkey: string;
  name?: string;
  picture?: string;
  nip05?: string;
}

export const NpubList: React.FC<NpubListProps> = ({
  setNpubList,
  NpubList,
  ListHeader,
  relays = ["wss://relay.nostr.band"],
}) => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (value && value.length >= 3 && !isValidIdentifier(value)) {
        performUserSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);
  };

  const removeParticipant = (participant: string) => {
    const updatedList = new Set(NpubList);
    updatedList.delete(participant);
    setNpubList(updatedList);
  };

  const renderList = () => {
    const elements: ReactNode[] = [];
    (NpubList || new Set()).forEach(
      (value: string) => {
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
    if (!searchInput) return;

    setIsProcessing(true);

    if (isValidNpub(searchInput)) {
      // Handle npub
      const pubkey = nip19.decode(searchInput).data as string;
      // @ts-ignore
      setNpubList(prev => {
        const updated = new Set(prev || new Set());
        updated.add(pubkey);
        return updated;
      });
      setSearchInput("");
      message.success("User added successfully");
    } else if (isValidNip05Format(searchInput)) {
      // Handle NIP-05
      try {
        const pubkey = await resolveNip05(searchInput);
        if (pubkey) {
          // @ts-ignore
          setNpubList(prev => {
            const updated = new Set(prev || new Set());
            updated.add(pubkey);
            return updated;
          });
          setSearchInput("");
          message.success("User added successfully");
        } else {
          message.error("Could not resolve NIP-05 identifier");
        }
      } catch (error) {
        message.error("Error resolving NIP-05 identifier");
      }
    }

    setIsProcessing(false);
    setShowResults(false);
  };

  const performUserSearch = async () => {
    setIsProcessing(true);
    try {
      const searchResults = await performNip50Search(relays, {
        query: searchInput,
        kinds: [0],
        limit: 10
      }, 3000);

      // Process results
      const users: UserResult[] = searchResults
        .map(event => {
          try {
            const profile = JSON.parse(event.content);
            return {
              pubkey: event.pubkey,
              name: profile.name || profile.displayName || "Unknown",
              picture: profile.picture,
              nip05: profile.nip05
            };
          } catch (e) {
            return { pubkey: event.pubkey };
          }
        })
        .filter(user => user && user.pubkey);

      setSearchResults(users);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectUser = (pubkey: string) => {
    // @ts-ignore
    setNpubList(prev => {
      const updated = new Set(prev || new Set());
      updated.add(pubkey);
      return updated;
    });
    setSearchInput("");
    setSearchResults([]);
    setShowResults(false);
    message.success("User added successfully");
  };

  return (
    <div>
      <AddNpubStyle className="modal-container">
        <Typography.Text style={{ fontSize: 18 }}>
          {ListHeader}
        </Typography.Text>
        <Divider />
        {renderList()}

        <div style={{ marginTop: 20 }}>
          <Input
            placeholder="Enter npub, NIP-05 (name@domain.com) or search by username"
            value={searchInput}
            onChange={handleInputChange}
            prefix={<SearchOutlined />}
            suffix={isProcessing ? <LoadingOutlined /> : null}
            style={{ marginBottom: 10 }}
          />

          {isValidIdentifier(searchInput) && (
            <Button
              type="primary"
              onClick={handleAddIdentifier}
              disabled={isProcessing}
              style={{ marginTop: 10, width: '100%' }}
            >
              {isProcessing ? <LoadingOutlined /> : `Add ${searchInput}`}
            </Button>
          )}

          {showResults && searchResults.length > 0 && (
            <List
              itemLayout="horizontal"
              dataSource={searchResults}
              style={{ marginTop: 10 }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small" onClick={() => handleSelectUser(item.pubkey)}>
                      Add User
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.picture} icon={!item.picture && <UserOutlined />} />}
                    title={item.name || nip19.npubEncode(item.pubkey).substring(0, 12) + "..."}
                    description={item.nip05 || nip19.npubEncode(item.pubkey)}
                  />
                </List.Item>
              )}
            />
          )}

          {showResults && searchResults.length === 0 && !isProcessing && (
            <Typography.Text type="secondary">
              No results found. Try a different search term.
            </Typography.Text>
          )}
        </div>
      </AddNpubStyle>
    </div>
  );
};