import { Event, SimplePool } from "nostr-tools";

export const getPublicForms = async (
  relays: string[],
  callback: (event: Event) => void
) => {
  let pool = new SimplePool();
  let filter = {
    kinds: [30168],
    limit: 50,
  };
  pool.subscribeMany(relays, [filter], {
    onevent: (e: Event) => {
      callback(e);
    },
  });
};
