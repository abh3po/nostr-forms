import React, {
  createContext,
  useState,
  useContext,
  FC,
  ReactNode,
  useEffect,
} from "react";
import { LOCAL_STORAGE_KEYS, getItem, setItem } from "../utils/localStorage";
import { Modal } from "antd";
import { Filter } from "nostr-tools";
import { useApplicationContext } from "../hooks/useApplicationContext";
import { getDefaultRelays } from "../nostr/common";

interface ProfileProviderProps {
  children?: ReactNode;
}

export interface ProfileContextType {
  pubkey?: string;
  requestPubkey: () => void;
  logout: () => void;
  userRelays: string[];
}

export interface IProfile {
  pubkey: string;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export const ProfileProvider: FC<ProfileProviderProps> = ({ children }) => {
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);
  const [usingNip07, setUsingNip07] = useState(false);
  const [userRelays, setUserRelays] = useState<string[]>([]);

  const { poolRef } = useApplicationContext();

  const fetchUserRelays = async (pubkey: string) => {
    if (!poolRef) return;
    let filter: Filter = {
      kinds: [10002],
      authors: [pubkey],
    };
    let relayEvent = await poolRef.current.get(getDefaultRelays(), filter);
    if (!relayEvent) return;
    let relayUrls = relayEvent.tags
      .filter((t) => t[0] === "r")
      .map((r) => r[1]);
    setUserRelays(relayUrls);
  };

  useEffect(() => {
    const profile = getItem<IProfile>(LOCAL_STORAGE_KEYS.PROFILE);
    if (profile) {
      setPubkey(profile.pubkey);
      fetchUserRelays(profile.pubkey);
    } else {
      console.log("Couldn't find npub");
    }
  }, [poolRef]);

  const logout = () => {
    setItem(LOCAL_STORAGE_KEYS.PROFILE, null);
    setPubkey(undefined);
  };

  const requestPubkey = async () => {
    setUsingNip07(true);
    let publicKey = await window.nostr.getPublicKey();
    setPubkey(publicKey);
    setItem(LOCAL_STORAGE_KEYS.PROFILE, { pubkey: publicKey });
    setUsingNip07(false);
    return pubkey;
  };

  return (
    <ProfileContext.Provider
      value={{ pubkey, requestPubkey, logout, userRelays }}
    >
      {children}
      <Modal
        open={usingNip07}
        footer={null}
        onCancel={() => setUsingNip07(false)}
      >
        {" "}
        Check your NIP07 Extension. If you do not have one, or wish to read
        more, checkout these{" "}
        <a
          href="https://github.com/aljazceru/awesome-nostr?tab=readme-ov-file#nip-07-browser-extensions"
          target="_blank noreferrer"
        >
          Awesome Nostr Recommendations
        </a>
      </Modal>
    </ProfileContext.Provider>
  );
};
