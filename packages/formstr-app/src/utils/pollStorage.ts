const LOCAL_STORAGE_KEYS = "pollerama:keys";

type Keys = { pubkey: string; secret?: string };

export const getKeysFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS) || "{}") as Keys;
};

export const setKeysInLocalStorage = (pubkey: string, secret?: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS, JSON.stringify({ pubkey, secret }));
};

export const removeKeysFromLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS);
};
