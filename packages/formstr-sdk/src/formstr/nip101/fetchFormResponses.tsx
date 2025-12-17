import { Event, Filter, SimplePool, getEventHash } from "nostr-tools";
import { getDefaultRelays } from "../formstr";

export const fetchFormResponses = async (
  pubKey: string,
  formId: string,
  allowedPubkeys?: string[],
  relays?: string[]
): Promise<Event[]> => {
  console.log("Starting to fetch!!!!");
  const pool = new SimplePool();
  let relayList = [...(relays || []), ...getDefaultRelays()];
  const filter: Filter = {
    kinds: [1069],
    "#a": [`30168:${pubKey}:${formId}`],
  };
  if (allowedPubkeys) filter.authors = allowedPubkeys;
  const nostrEvents = await pool.querySync(relayList, filter);
  return nostrEvents;
};
