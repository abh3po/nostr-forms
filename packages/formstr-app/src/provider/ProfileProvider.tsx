import React, {
  createContext,
  useState,
  useContext,
  FC,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { LOCAL_STORAGE_KEYS, getItem, setItem } from "../utils/localStorage";
import { Modal, message } from "antd";
import { Filter, SimplePool, UnsignedEvent } from "nostr-tools";
import { useApplicationContext } from "../hooks/useApplicationContext";
import { getDefaultRelays } from "../nostr/common";
import RelayManagerModal from "../containers/CreateFormNew/components/FormSettings/RelayManagerModal";
import { RelayItem } from "../containers/CreateFormNew/providers/FormBuilder/typeDefs";

interface ProfileProviderProps {
  children?: ReactNode;
}

export interface ProfileContextType {
  pubkey?: string;
  requestPubkey: () => void;
  logout: () => void;
  userRelays: string[];
  isGlobalRelayModalOpen: boolean;
  toggleGlobalRelayModal: () => void;
  updateUserRelays: (newRelays: string[]) => Promise<void>;
  restoreToAppDefaults: () => void;
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
  const [isGlobalRelayModalOpen, setGlobalRelayModalOpen] = useState(false);

  const { poolRef } = useApplicationContext();

  const fetchUserRelaysFromNostr = useCallback(async (pubkey: string) => {
    if (!poolRef) return;
    let filter: Filter = {
      kinds: [10002],
      authors: [pubkey],
    };
    let relayEvent = await poolRef.current.get(getDefaultRelays(), filter);
    if (!relayEvent) {
      setUserRelays(getDefaultRelays());
      return;
    };
    let relayUrls = relayEvent.tags
      .filter((t) => t[0] === "r")
      .map((r) => r[1]);
    setUserRelays(relayUrls);
  }, [poolRef]);

  useEffect(() => {
    const profile = getItem<IProfile>(LOCAL_STORAGE_KEYS.PROFILE);
    if (profile) {
      setPubkey(profile.pubkey);
      fetchUserRelaysFromNostr(profile.pubkey);
    } else {
      setUserRelays(getDefaultRelays());
    }
  }, [poolRef, fetchUserRelaysFromNostr]);

  const logout = () => {
    setItem(LOCAL_STORAGE_KEYS.PROFILE, null);
    setPubkey(undefined);
    setUserRelays(getDefaultRelays());
  };

  const requestPubkey = async () => {
    setUsingNip07(true);
    let publicKey = await window.nostr.getPublicKey();
    setPubkey(publicKey);
    setItem(LOCAL_STORAGE_KEYS.PROFILE, { pubkey: publicKey });
    await fetchUserRelaysFromNostr(publicKey);
    setUsingNip07(false);
    return pubkey;
  };

  const toggleGlobalRelayModal = () => {
    setGlobalRelayModalOpen(prev => !prev);
  };

  const updateUserRelays = async (newRelays: string[]) => {
    const oldRelays = [...userRelays];
    setUserRelays(newRelays);
    message.success("Default relays updated.");

    if (!pubkey) {
        message.warning("Login to save your relay list to Nostr.");
        return;
    };

    try {
      const tags = newRelays.map(url => ['r', url]);
      const event: UnsignedEvent = {
        kind: 10002,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: "",
        pubkey,
      };
      
      const signedEvent = await window.nostr.signEvent(event);
      const pool = new SimplePool();
      await Promise.allSettled(pool.publish(getDefaultRelays(), signedEvent));
      pool.close(getDefaultRelays());
      message.success("Relay list published to Nostr!");
    } catch (error) {
      console.error("Failed to publish NIP-65 event", error);
      message.error("Failed to publish relay list to Nostr.");
      setUserRelays(oldRelays);
      throw error;
    }
  };

  const restoreToAppDefaults = () => {
    updateUserRelays(getDefaultRelays()).catch(() => {});
  };

  const handleAddRelay = (url: string) => {
    if (userRelays.includes(url)) {
      message.warning('Relay already exists.');
      return;
    }
    updateUserRelays([...userRelays, url]).catch(() => {});
  };

  const handleEditRelay = (tempId: string, newUrl: string) => {
    const relayIndex = userRelays.findIndex(url => url === tempId);
    if (relayIndex !== -1) {
      const updatedRelays = [...userRelays];
      updatedRelays[relayIndex] = newUrl;
      updateUserRelays(updatedRelays).catch(() => {});
    }
  };

  const handleDeleteRelay = (tempId: string) => {
    const updatedRelays = userRelays.filter(url => url !== tempId);
    updateUserRelays(updatedRelays).catch(() => {});
  };

  const relayItems: RelayItem[] = userRelays.map(url => ({ url, tempId: url }));


  return (
    <ProfileContext.Provider
      value={{ 
        pubkey, 
        requestPubkey, 
        logout, 
        userRelays,
        isGlobalRelayModalOpen,
        toggleGlobalRelayModal,
        updateUserRelays,
        restoreToAppDefaults,
      }}
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
          target="_blank"
          rel="noopener noreferrer"
        >
          Awesome Nostr Recommendations
        </a>
      </Modal>
      {isGlobalRelayModalOpen && (
        <RelayManagerModal
          isOpen={isGlobalRelayModalOpen}
          onClose={toggleGlobalRelayModal}
          relayList={relayItems}
          addRelayToList={handleAddRelay}
          editRelayInList={handleEditRelay}
          deleteRelayFromList={handleDeleteRelay}
          onRestoreDefaults={restoreToAppDefaults}
          restoreButtonText="Restore to App Defaults"
        />
      )}
    </ProfileContext.Provider>
  );
};
