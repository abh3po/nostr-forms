import React, {
  createContext,
  useState,
  useContext,
  FC,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { LOCAL_STORAGE_KEYS, getItem, setItem } from "../utils/localStorage";
import { Button, Modal } from "antd";
import { Filter } from "nostr-tools";
import { useApplicationContext } from "../hooks/useApplicationContext";
import { getDefaultRelays } from "../nostr/common";
import { BunkerSigner, parseBunkerInput, BunkerPointer, toBunkerURL } from "nostr-tools/nip46";
import Nip46Login from "../components/Nip46Login";

// Keep a reference to the original NIP-07 signer if it exists
const originalNostr = window.nostr;

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
  const [userRelays, setUserRelays] = useState<string[]>([]);
  const [loginChoiceModal, setLoginChoiceModal] = useState(false);
  const [nip46Modal, setNip46Modal] = useState(false);
  const bunkerSignerRef = useRef<BunkerSigner | null>(null);

  const { poolRef } = useApplicationContext();

  const createBunkerAdapter = (signer: BunkerSigner) => ({
    getPublicKey: () => signer.getPublicKey(),
    signEvent: (event: any) => signer.signEvent(event),
    nip04: {
      encrypt: (pubkey: string, plaintext: string) => signer.nip04Encrypt(pubkey, plaintext),
      decrypt: (pubkey: string, ciphertext: string) => signer.nip04Decrypt(pubkey, ciphertext),
    },
    nip44: {
      encrypt: (pubkey: string, plaintext: string) => signer.nip44Encrypt(pubkey, plaintext),
      decrypt: (pubkey: string, ciphertext: string) => signer.nip44Decrypt(pubkey, ciphertext),
    },
    getRelays: () => {
      if (signer.bp.relays && signer.bp.relays.length > 0) {
        return signer.bp.relays.reduce((acc, relayUrl) => {
          acc[relayUrl] = { read: true, write: true };
          return acc;
        }, {} as { [url: string]: { read: boolean, write: boolean } });
      }
      return {};
    },
  });

  const handleNip46Login = async (signer: BunkerSigner, bunkerPointer: BunkerPointer) => {
    bunkerSignerRef.current = signer;
    const bunkerPubkey = await signer.getPublicKey();
    setPubkey(bunkerPubkey);
    setItem(LOCAL_STORAGE_KEYS.PROFILE, { pubkey: bunkerPubkey });
    setItem(LOCAL_STORAGE_KEYS.LOGIN_METHOD, "nip46", { parseAsJson: false });
    setItem(LOCAL_STORAGE_KEYS.BUNKER_URL, toBunkerURL(bunkerPointer), { parseAsJson: false });
    window.nostr = createBunkerAdapter(signer) as any;
    setNip46Modal(false);
  };

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

  const attemptAutoLogin = async () => {
    const profile = getItem<IProfile>(LOCAL_STORAGE_KEYS.PROFILE);
    if (profile) {
      const loginMethod = getItem<string>(LOCAL_STORAGE_KEYS.LOGIN_METHOD, { parseAsJson: false });
      
      if (loginMethod === 'nip46') {
        const bunkerUrl = getItem<string>(LOCAL_STORAGE_KEYS.BUNKER_URL, { parseAsJson: false });
        if (bunkerUrl) {
          try {
            const bunkerPointer = await parseBunkerInput(bunkerUrl);
            if (bunkerPointer) {
              const clientSecretKey = new Uint8Array(32);
              window.crypto.getRandomValues(clientSecretKey);
              const signer = new BunkerSigner(clientSecretKey, bunkerPointer, {
                onauth: (url: string) => {
                  // Silently wait for re-authentication if required
                }
              });
              await signer.connect();
              bunkerSignerRef.current = signer;
              window.nostr = createBunkerAdapter(signer) as any;
              setPubkey(profile.pubkey);
              fetchUserRelays(profile.pubkey);
            }
          } catch (e) {
            console.error('[AutoLogin] NIP-46 auto-login failed:', e);
          }
        }
      } else {
        setPubkey(profile.pubkey);
        fetchUserRelays(profile.pubkey);
      }
    }
  };

  useEffect(() => {
    attemptAutoLogin();
  }, []);

  const logout = () => {
    if (bunkerSignerRef.current) {
      bunkerSignerRef.current.close();
      bunkerSignerRef.current = null;
    }
    setItem(LOCAL_STORAGE_KEYS.PROFILE, null);
    setItem(LOCAL_STORAGE_KEYS.LOGIN_METHOD, null);
    setItem(LOCAL_STORAGE_KEYS.BUNKER_URL, null);
    setPubkey(undefined);
    window.nostr = originalNostr;
  };

  const requestPubkey = async () => {
    setLoginChoiceModal(true);
  };
  
  const handleNip07Login = async () => {
    setLoginChoiceModal(false);
    if (originalNostr) {
      window.nostr = originalNostr;
      try {
        const publicKey = await window.nostr.getPublicKey();
        setPubkey(publicKey);
        setItem(LOCAL_STORAGE_KEYS.PROFILE, { pubkey: publicKey });
        setItem(LOCAL_STORAGE_KEYS.LOGIN_METHOD, "nip07", { parseAsJson: false });
      } catch (e) {
        console.error('[NIP07] Login failed:', e);
        alert("NIP-07 login failed. Please check your extension.");
      }
    } else {
      alert("NIP-07 extension not found.");
    }
  };

  return (
    <ProfileContext.Provider
      value={{ pubkey, requestPubkey, logout, userRelays }}
    >
      {children}
      <Modal
        open={loginChoiceModal}
        onCancel={() => setLoginChoiceModal(false)}
        footer={null}
        title="Choose Login Method"
      >
        <Button type="primary" block onClick={handleNip07Login} style={{ marginBottom: 10 }}>
          Use Browser Extension (NIP-07)
        </Button>
        <Button block onClick={() => { setLoginChoiceModal(false); setNip46Modal(true); }}>
          Use Remote Signer (NIP-46)
        </Button>
      </Modal>
      <Nip46Login 
        isOpen={nip46Modal}
        onClose={() => setNip46Modal(false)}
        onLogin={handleNip46Login}
      />
    </ProfileContext.Provider>
  );
};