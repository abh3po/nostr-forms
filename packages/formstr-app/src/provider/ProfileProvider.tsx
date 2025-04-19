import {
  createContext,
  useState,
  useContext,
  FC,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { LOCAL_STORAGE_KEYS, getItem, setItem } from "../utils/localStorage";
import { Modal } from "antd";
import { fetchUserProfile } from "../nostr/poll";
import { DEFAULT_IMAGE_URL } from "../utils/constants";
import { Event, SimplePool } from "nostr-tools";
import { getKeysFromLocalStorage } from "../utils/pollStorage";

interface ProfileProviderProps {
  children?: ReactNode;
}

export type User = {
  name?: string;
  picture?: string;
  pubkey: string;
  privateKey?: string;
  follows?: string[];
};

export interface ProfileContextType {
  pubkey: string | undefined;
  requestPubkey: () => Promise<string | undefined>;
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export type Profile = {
  event: Event;
  picture: string;
  [key: string]: any;
};

export const ANONYMOUS_USER_NAME = "Anon...";

export interface IProfile {
  pubkey: string;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider: FC<ProfileProviderProps> = ({ children }) => {
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);
  const [usingNip07, setUsingNip07] = useState(false);
  const poolRef = useRef(new SimplePool());
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  useEffect(() => {
    const profile = getItem<IProfile>(LOCAL_STORAGE_KEYS.PROFILE);
    if (profile) {
      setPubkey(profile.pubkey);
    } else {
      console.log("Couldn't find npub");
    }
  }, []);

  const logout = () => {
    setItem(LOCAL_STORAGE_KEYS.PROFILE, null);
    setPubkey(undefined);
    setUser(null);
  };

  const requestPubkey = async () => {
    try {
      setUsingNip07(true);
      const publicKey = await window.nostr.getPublicKey();
      setPubkey(publicKey);
      setItem(LOCAL_STORAGE_KEYS.PROFILE, { pubkey: publicKey });
      
      if (user) {
        setUser({
          ...user,
          pubkey: publicKey
        });
      } else {
        setUser({
          name: ANONYMOUS_USER_NAME,
          picture: DEFAULT_IMAGE_URL,
          pubkey: publicKey
        });
      }
      
      return publicKey;
    } catch (error) {
      console.error("Error getting public key:", error);
      return undefined;
    } finally {
      setUsingNip07(false);
    }
  };

  const addEventToProfiles = (event: Event) => {
    if (profiles.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content);
      const newProfiles = new Map(profiles);
      newProfiles.set(event.pubkey, { ...content, event: event });
      setProfiles(newProfiles);
    } catch (e) {
      console.error("Error parsing event", e);
    }
  };

  useEffect(() => {
    const keys = getKeysFromLocalStorage();
    if (Object.keys(keys).length !== 0 && !user) {
      fetchUserProfile(keys.pubkey, poolRef.current).then(
        (kind0: Event | null) => {
          if (!kind0) {
            setUser({
              name: ANONYMOUS_USER_NAME,
              picture: DEFAULT_IMAGE_URL,
              pubkey: keys.pubkey,
              privateKey: keys.secret,
            });
            setPubkey(keys.pubkey); 
            return;
          }
          let profile = JSON.parse(kind0.content);
          setUser({
            name: profile.name,
            picture: profile.picture,
            pubkey: keys.pubkey,
            privateKey: keys.secret,
            ...profile,
          });
          setPubkey(keys.pubkey); 
          addEventToProfiles(kind0);
        }
      );
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ pubkey, requestPubkey, logout, user, setUser }}>
      {children}
      <Modal
        open={usingNip07}
        footer={null}
        onCancel={() => setUsingNip07(false)}
      >
        Check your NIP07 Extension. If you do not have one, or wish to read
        more, checkout these{" "}
        <a
          href="https://github.com/aljazceru/awesome-nostr?tab=readme-ov-file#nip-07-browser-extensions"
          target="_blank"
          rel="noreferrer"
        >
          Awesome Nostr Recommendations
        </a>
      </Modal>
    </ProfileContext.Provider>
  );
};