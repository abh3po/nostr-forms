import { UserOutlined } from "@ant-design/icons";
import { getDefaultRelays } from "@formstr/sdk";
import { Avatar } from "antd";
import { FC, useEffect, useState } from "react";
import { getAuthed } from "../../pool";

const defaultRelays = getDefaultRelays();

interface NostrAvatarProps {
  pubkey?: string;
}

interface Profile {
  name?: string;
  picture?: string;
}
export const NostrAvatar: FC<NostrAvatarProps> = ({ pubkey }) => {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  async function getProfile() {
    let filter = {
      kinds: [0],
      authors: [pubkey!],
    };
    const profile = await getAuthed(defaultRelays, filter);
    if (profile) setProfile(JSON.parse(profile.content) as Profile);
  }
  useEffect(() => {
    if (!profile && pubkey) getProfile();
  });
  return (
    <Avatar
      src={profile?.picture || <UserOutlined style={{ color: "black" }} />}
      alt={profile?.name}
    />
  );
};
