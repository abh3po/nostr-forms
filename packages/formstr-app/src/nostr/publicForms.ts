import { Event, SimplePool } from "nostr-tools";
import { NOSTR_KINDS, NOSTR_LIMITS } from "../constants/nostr";

export const getPublicForms = async (
  relays: string[],
  callback: (event: Event) => void
) => {
  let pool = new SimplePool();
  let filter = {
    kinds: [NOSTR_KINDS.FORM_TEMPLATE],
    limit: NOSTR_LIMITS.PUBLIC_FORMS_LIMIT,
  };
  pool.subscribeMany(relays, [filter], {
    onevent: (e: Event) => {
      callback(e);
    },
  });
};
