// nip46.ts
import { EventTemplate, generateSecretKey, UnsignedEvent } from "nostr-tools";
import {
  BunkerSignerParams,
  BunkerPointer,
  parseBunkerInput,
  BunkerSigner,
} from "nostr-tools/nip46";
import { NostrSigner } from "./types";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { getAppSecretKeyFromLocalStorage } from "./utils";

export async function createNip46Signer(
  bunkerUri: string,
  params: BunkerSignerParams = {}
): Promise<NostrSigner> {
  const bp: BunkerPointer | null = await parseBunkerInput(bunkerUri);

  if (!bp) throw new Error("Invalid NIP-46 URI");

  const clientSecretKey: Uint8Array = getAppSecretKeyFromLocalStorage();

  const bunker = new BunkerSigner(clientSecretKey, bp, params);
  console.log("BUNKER Created", bunker);

  await bunker.connect();
  const wrapper: NostrSigner = {
    getPublicKey: async () => await bunker.getPublicKey(),
    signEvent: async (event: EventTemplate) => {
      // client-pubkey is baked into the conversation, remote returns correctly‐signed user-event
      //   const unsignedEvent = { pubkey: await bunker.getPublicKey(), ...event };
      //   return bunker.signEvent(unsignedEvent);
      return bunker.signEvent(event as UnsignedEvent);
    },
    encrypt: async (pubkey, plaintext) =>
      bunker.nip04Encrypt(pubkey, plaintext),
    decrypt: async (pubkey, ciphertext) =>
      bunker.nip04Decrypt(pubkey, ciphertext),
    nip44Encrypt: async (pubkey, txt) => bunker.nip44Encrypt(pubkey, txt),
    nip44Decrypt: async (pubkey, ct) => bunker.nip44Decrypt(pubkey, ct),
  };

  return wrapper;
}
