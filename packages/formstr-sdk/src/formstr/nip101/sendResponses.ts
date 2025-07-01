import { SimplePool, UnsignedEvent, nip44 } from "nostr-tools";
import { getDefaultRelays, getUserPublicKey, signEvent } from "../formstr";

import { bytesToHex } from "@noble/hashes/utils";
import { Response } from "./interfaces";

const defaultRelays = getDefaultRelays();

const encryptResponse = async (
  message: string,
  receiverPublicKey: string,
  senderPrivateKey: Uint8Array | null
) => {
  if (!senderPrivateKey) {
    return await window.nostr.nip44.encrypt(receiverPublicKey, message);
  }
  let conversationKey = nip44.v2.utils.getConversationKey(
    bytesToHex(senderPrivateKey),
    receiverPublicKey
  );
  return nip44.v2.encrypt(message, conversationKey);
};

export const sendResponses = async (
  formAuthorPub: string,
  formId: string,
  responses: Response[],
  responderSecretKey: Uint8Array | null = null,
  encryptResponses: boolean = true,
  relays: string[] = []
) => {
  let responderPub;
  responderPub = await getUserPublicKey(responderSecretKey);
  if (!responderPub) {
    throw new Error("Responder public key not available");
  }
  let tags = [["a", `30168:${formAuthorPub}:${formId}`]];
  let content = "";
  if (!encryptResponses) {
    tags = [...tags, ...responses];
  } else {
    content = await encryptResponse(
      JSON.stringify(responses),
      formAuthorPub,
      responderSecretKey
    );
  }
  const baseEvent: UnsignedEvent = {
    kind: 1069,
    pubkey: responderPub,
    tags: tags,
    content: content,
    created_at: Math.floor(Date.now() / 1000),
  };

  const fullEvent = await signEvent(baseEvent, responderSecretKey);
  const pool = new SimplePool();
  const relayList = [...relays, ...defaultRelays];
  const messages = await Promise.allSettled(pool.publish(relayList, fullEvent));
  console.log("Message from relays", messages);
  pool.close(relayList);
};
