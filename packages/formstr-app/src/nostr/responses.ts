import { Event, Filter, SimplePool } from "nostr-tools";
import { getDefaultRelays } from "./common";
import { SubCloser } from "nostr-tools/abstract-pool";
import { getOnAuthed } from "../pool";

export const fetchFormResponses = async (
  pubKey: string,
  formId: string,
  pool: SimplePool,
  handleResponseEvent: (event: Event) => void,
  allowedPubkeys?: string[],
  relays?: string[]
): Promise<SubCloser> => {
  let relayList = [...(relays || []), ...getDefaultRelays()];
  const filter: Filter = {
    kinds: [1069],
    "#a": [`30168:${pubKey}:${formId}`],
  };
  if (allowedPubkeys) filter.authors = allowedPubkeys;
  let closer = pool.subscribeMany(relayList, [filter], {
    onevent: handleResponseEvent,
    onauth: await getOnAuthed(),
  });
  return closer;
};
