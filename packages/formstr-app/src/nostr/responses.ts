import { Event, Filter, SimplePool, SubCloser, getEventHash, utils } from "nostr-tools";
import { getDefaultRelays } from "./common"

export const fetchFormResponses = (
  pubKey: string,
  formId: string,
  pool: SimplePool,
  handleResponseEvent: (event: Event) => void,
  allowedPubkeys?: string[],
  relays?: string[],
): SubCloser => {
  let relayList = [...(relays || []), ...getDefaultRelays()];
  const filter: Filter = {
    kinds: [1069],
    "#a": [`30168:${pubKey}:${formId}`],
  };
  if (allowedPubkeys) filter.authors = allowedPubkeys;
  let closer = pool.subscribeMany(relayList, [filter],  {
    onevent: handleResponseEvent
  })
  return closer;
};
