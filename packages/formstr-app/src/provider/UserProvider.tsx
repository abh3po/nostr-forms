import { createContext, FC, ReactNode, useEffect, useRef, useState } from "react";
import { fetchUserProfile } from "../nostr/poll";
import { DEFAULT_IMAGE_URL } from "../utils/constants";
import { Event, SimplePool } from "nostr-tools";
import { getKeysFromLocalStorage } from "../utils/pollStorage";


interface UserProviderProps {
  children?: ReactNode;
}
export type Profile = {
    event: Event;
    picture: string;
    [key: string]: any;
  };
export type User = {
    name?: string;
    picture?: string;
    pubkey: string;
    privateKey?: string;
    follows?: string[];
  };

interface UserContextInterface {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const ANONYMOUS_USER_NAME = "Anon...";

export const UserContext = createContext<UserContextInterface | null>(null);

export const UserProvider : FC<UserProviderProps> = ({ 
    children,
}) => {
    
    const [user, setUser] = useState<User | null>(null);
    const poolRef = useRef(new SimplePool());
    const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

    const addEventToProfiles = (event: Event) => {
        if (profiles.has(event.pubkey)) return;
        try {
          let content = JSON.parse(event.content);
          profiles.set(event.pubkey, { ...content, event: event });
          setProfiles(profiles);
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
          addEventToProfiles(kind0);
        }
      );
    } else {
      setUser(null);
    }
  }, [profiles]);

    return (
        <UserContext.Provider value={{ user, setUser }}> 
            {children}
        </UserContext.Provider>
    );
};

