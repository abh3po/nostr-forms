import { UnsignedEvent } from "nostr-tools";
import { BunkerSigner } from "nostr-tools/nip46";
import { NostrSigner } from "./types";

export function createNip46Signer(signer: BunkerSigner): NostrSigner {
  return {
    getPublicKey: () => signer.getPublicKey(),
    async signEvent(event) {
      const unsignedEvent: UnsignedEvent = {
        ...event,
        pubkey: await this.getPublicKey(),
      };
      return signer.signEvent(unsignedEvent);
    },
    nip04: {
      encrypt: (pubkey, plaintext) => signer.nip04Encrypt(pubkey, plaintext),
      decrypt: (pubkey, ciphertext) => signer.nip04Decrypt(pubkey, ciphertext),
    },
    nip44: {
      encrypt: (pubkey, plaintext) => signer.nip44Encrypt(pubkey, plaintext),
      decrypt: (pubkey, ciphertext) => signer.nip44Decrypt(pubkey, ciphertext),
    },
    getRelays: () => {
      if (signer.bp.relays && signer.bp.relays.length > 0) {
        const relays = signer.bp.relays.reduce((acc, relayUrl) => {
          acc[relayUrl] = { read: true, write: true };
          return acc;
        }, {} as { [url: string]: { read: boolean; write: boolean } });
        return Promise.resolve(relays);
      }
      return Promise.resolve({});
    },
  };
}