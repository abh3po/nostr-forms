import React, { useState, useEffect } from "react";
import { Input, List, Avatar, Spin, Typography, Button, Select } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { performNip50Search } from "./utils";
import { nip19 } from "nostr-tools";

const { Option } = Select;

interface UserSearchProps {
  onSelectUser: (pubkey: string) => void;
  relays: string[];
}

interface UserResult {
  pubkey: string;
  name?: string;
  picture?: string;
  nip05?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, relays }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserResult[]>([]);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [domain, setDomain] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        performSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, language, domain]);

  const performSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;

    setSearching(true);
    try {
      const searchResults = await performNip50Search(relays, {
        query: searchQuery,
        kinds: [0],
        language,
        domain,
        limit: 20
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

      setResults(users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (pubkey: string) => {
    onSelectUser(pubkey);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", marginBottom: 10 }}>
        <Input
          placeholder="Search users by name or keywords"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ flexGrow: 1, marginRight: 10 }}
        />

        <Select
          placeholder="Domain"
          allowClear
          style={{ width: 150, marginRight: 10 }}
          onChange={(value) => setDomain(value)}
        >
          <Option value="nostr.com">nostr.com</Option>
          <Option value="iris.to">iris.to</Option>
          <Option value="primal.net">primal.net</Option>
        </Select>

        <Select
          placeholder="Language"
          allowClear
          style={{ width: 100 }}
          onChange={(value) => setLanguage(value)}
        >
          <Option value="en">English</Option>
          <Option value="es">Spanish</Option>
          <Option value="de">German</Option>
          <Option value="fr">French</Option>
          <Option value="ja">Japanese</Option>
        </Select>
      </div>

      {searching ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={results}
          locale={{ emptyText: results.length === 0 && searchQuery.length >= 3 ? "No users found" : "Search for users" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="primary" size="small" onClick={() => handleSelect(item.pubkey)}>
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
    </div>
  );
};

export default UserSearch;