import { Event, EventTemplate, UnsignedEvent } from "nostr-tools";
import { NostrSigner } from "./types"; // Adjust the path as needed

export const nip07Signer: NostrSigner = {
  getPublicKey: async (): Promise<string> => {
    if (!window.nostr) throw new Error("NIP-07 signer not found");
    return window.nostr.getPublicKey();
  },

  signEvent: async (event: EventTemplate): Promise<Event> => {
    if (!window.nostr) throw new Error("NIP-07 signer not found");
    return window.nostr.signEvent(event);
  },

  encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
    if (!window.nostr?.nip04)
      throw new Error("NIP-04 encryption not supported");
    return window.nostr.nip04.encrypt(pubkey, plaintext);
  },

  decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
    if (!window.nostr?.nip04)
      throw new Error("NIP-04 decryption not supported");
    return window.nostr.nip04.decrypt(pubkey, ciphertext);
  },
  nip44Decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
    if (!window.nostr?.nip44)
      throw new Error("NIP-44 decryption not supported");
    return window.nostr.nip44.decrypt(pubkey, ciphertext);
  },
  nip44Encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
    if (!window.nostr?.nip44)
      throw new Error("NIP-44 encryption not supported");
    return window.nostr.nip44.encrypt(pubkey, plaintext);
  },
};
