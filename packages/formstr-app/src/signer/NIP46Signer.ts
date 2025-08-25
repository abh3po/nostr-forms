// nip46.ts
import { EventTemplate, UnsignedEvent } from "nostr-tools";
import {
  BunkerSignerParams,
  BunkerPointer,
  parseBunkerInput,
} from "nostr-tools/nip46";
import { NostrSigner } from "./types";
import { getAppSecretKeyFromLocalStorage } from "./utils";
import { BunkerSigner } from "./nip46";

export async function createNip46Signer(
  uri: string,
  params: BunkerSignerParams = {}
): Promise<NostrSigner> {
  const parsedUri = new URL(uri);
  const clientSecretKey: Uint8Array = getAppSecretKeyFromLocalStorage();
  if (parsedUri.protocol === "bunker:") {
    const bp: BunkerPointer | null = await parseBunkerInput(uri);
    if (!bp) throw new Error("Invalid NIP-46 URI");
    const bunker = BunkerSigner.fromBunker(clientSecretKey, bp, params);
    await bunker.connect();
    console.log("BUNKER CONNECTED");
    return wrapBunkerSigner(bunker);
  } else if (parsedUri.protocol === "nostrconnect:") {
    return BunkerSigner.fromURI(clientSecretKey, uri, params);
  } else {
    console.log("URL PROTOCOL IS", parsedUri.protocol);
    throw new Error("INVALID URI");
  }
}

const wrapBunkerSigner = (bunker: BunkerSigner) => {
  return {
    getPublicKey: async () => await bunker.getPublicKey(),
    signEvent: async (event: EventTemplate) => {
      // client-pubkey is baked into the conversation, remote returns correctly‐signed user-event
      //   const unsignedEvent = { pubkey: await bunker.getPublicKey(), ...event };
      //   return bunker.signEvent(unsignedEvent);
      return bunker.signEvent(event as UnsignedEvent);
    },
    encrypt: async (pubkey: string, plaintext: string) =>
      bunker.nip04Encrypt(pubkey, plaintext),
    decrypt: async (pubkey: string, ciphertext: string) =>
      bunker.nip04Decrypt(pubkey, ciphertext),
    nip44Encrypt: async (pubkey: string, txt: string) =>
      bunker.nip44Encrypt(pubkey, txt),
    nip44Decrypt: async (pubkey: string, ct: string) =>
      bunker.nip44Decrypt(pubkey, ct),
  };
};
