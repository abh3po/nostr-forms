import { useEffect, useState } from "react";
import { generateSecretKey } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

export const LOCAL_STORAGE_KEYS = {
  LOCAL_FORMS: "formstr:forms",
  DRAFT_FORMS: "formstr:draftForms",
  SUBMISSIONS: "formstr:submissions",
  PROFILE: "formstr:profile",
  OLLAMA_CONFIG: "formstr:ollama_config",
  LOGIN_METHOD: "formstr:login_method",
  BUNKER_URL: "formstr:bunker_url",
  NIP46_CLIENT_SECRET: "formstr:nip46_client_secret",
};

export function getItem<T>(key: string, { parseAsJson = true } = {}): T | null {
  let value = localStorage.getItem(key);
  if (value === null) {
    return value;
  }
  if (parseAsJson) {
    try {
      value = JSON.parse(value);
    } catch (e) {
      value = null;
      localStorage.removeItem(key);
    }
  }

  return value as T;
}

export const setItem = (
  key: string,
  value: any,
  { parseAsJson = true } = {}
) => {
  let valueToBeStored = value;
  if (parseAsJson) {
    valueToBeStored = JSON.stringify(valueToBeStored);
  }
  try {
    localStorage.setItem(key, valueToBeStored);
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.log("Error in setItem: ", e);
  }
};

export const useLocalStorageItems = <T>(
  key: string,
  { parseAsJson = true } = {}
): T | null => {
  const [item, updateItem] = useState(getItem<T>(key, { parseAsJson }));
  useEffect(() => {
    const listener = () => {
      updateItem(getItem<T>(key, { parseAsJson }));
    };
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("storage", listener);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return item;
};

export const getNip46ClientSecret = (): Uint8Array => {
  const hexKey = getItem<string>(LOCAL_STORAGE_KEYS.NIP46_CLIENT_SECRET, { parseAsJson: false });
  if (hexKey) {
    try {
      return hexToBytes(hexKey);
    } catch (e) {
      console.error("Failed to decode stored NIP-46 client secret:", e);
    }
  }

  const newKey = generateSecretKey();
  setItem(LOCAL_STORAGE_KEYS.NIP46_CLIENT_SECRET, bytesToHex(newKey), { parseAsJson: false });
  return newKey;
};