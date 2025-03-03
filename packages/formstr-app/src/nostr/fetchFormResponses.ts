import { Event, Filter, SimplePool } from "nostr-tools";
import { getDefaultRelays } from "./common";

export const fetchFormResponses = async (
  pubKey: string,
  formId: string,
  allowedPubkeys?: string[],
  relays?: string[]
): Promise<Event[]> => {
  console.log("Starting to fetch from relays!!!!", relays);
  const pool = new SimplePool();
  let relayList = [...(relays || []), ...getDefaultRelays()];
  const filter: Filter = {
    kinds: [1069],
    "#a": [`30168:${pubKey}:${formId}`],
  };
  if (allowedPubkeys) filter.authors = allowedPubkeys;
  const nostrEvents = await pool.querySync(relayList, filter);
  console.log("Got Response Events as", nostrEvents);
  pool.close(relayList);
  return nostrEvents;
};
