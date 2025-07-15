import { Event, EventTemplate } from "nostr-tools";

export interface NostrSigner {
  getPublicKey(): Promise<string>;
  signEvent(event: EventTemplate): Promise<Event>;
  getRelays?(): Promise<{ [url: string]: { read: boolean; write: boolean } }>;
  nip04: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
  nip44: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}