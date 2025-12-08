import { EventTemplate, SimplePool, VerifiedEvent } from "nostr-tools";
import { signerManager } from "../signer";

export const pool = new SimplePool();

export const getOnAuthed = async () => {
  const signer = await signerManager.getSigner();
  if (signer) {
    return async (ev: EventTemplate) => {
      await signer.signEvent(ev);
      return ev as VerifiedEvent;
    };
  }
  return undefined;
};
