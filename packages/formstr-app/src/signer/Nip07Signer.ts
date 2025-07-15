import { Event, EventTemplate } from "nostr-tools";
import { NostrSigner } from "./types";

const nip07Signer: NostrSigner = {
  async getPublicKey() {
    if (!window.nostr) throw new Error("NIP-07 extension not found.");
    return window.nostr.getPublicKey();
  },
  async signEvent(event) {
    if (!window.nostr) throw new Error("NIP-07 extension not found.");
    // The window.nostr type might be slightly different, but the result is a valid Event.
    return window.nostr.signEvent(event) as Promise<Event>;
  },
  async getRelays() {
    if (window.nostr && 'getRelays' in window.nostr && typeof window.nostr.getRelays === 'function') {
      return window.nostr.getRelays();
    }
    return Promise.resolve({});
  },
  nip04: {
    async encrypt(pubkey, plaintext) {
      if (!window.nostr?.nip04) throw new Error("NIP-04 not supported by extension.");
      return window.nostr.nip04.encrypt(pubkey, plaintext);
    },
    async decrypt(pubkey, ciphertext) {
      if (!window.nostr?.nip04) throw new Error("NIP-04 not supported by extension.");
      return window.nostr.nip04.decrypt(pubkey, ciphertext);
    },
  },
  nip44: {
    async encrypt(pubkey, plaintext) {
      if (!window.nostr?.nip44) throw new Error("NIP-44 not supported by extension.");
      return window.nostr.nip44.encrypt(pubkey, plaintext);
    },
    async decrypt(pubkey, ciphertext) {
      if (!window.nostr?.nip44) throw new Error("NIP-44 not supported by extension.");
      return window.nostr.nip44.decrypt(pubkey, ciphertext);
    },
  },
};

export { nip07Signer };