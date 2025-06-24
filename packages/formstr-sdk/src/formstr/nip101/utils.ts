import { bytesToHex } from "@noble/hashes/utils";
import { nip44 } from "nostr-tools";

export const nip44Encrypt = (
  privKey: Uint8Array,
  pubkey: string,
  message: string
) => {
  let conversationKey = nip44.v2.utils.getConversationKey(privKey, pubkey);
  let cipherText = nip44.v2.encrypt(message, conversationKey);
  return cipherText;
};
