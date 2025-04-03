import { nip19 } from "nostr-tools";

export const isValidNpub = (npub: string) => {
  if (!npub.startsWith("npub1") || npub.length !== 63) {
    return false;
  }
  try {
    const decoded = nip19.decode(npub);
    return decoded.type === "npub"; // Ensure it’s an npub
  } catch {
    return false; // Invalid encoding or checksum
  }
};
