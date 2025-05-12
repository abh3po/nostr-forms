import { Event, SimplePool } from "nostr-tools";
import { getDefaultRelays } from "./common";

export const fetchFormTemplate = async (
  pubKey: string,
  formIdentifier: string,
  pool: SimplePool,
  onEvent: (event: Event) => void,
  relays?: string[]
): Promise<void> => {
  let formIdPubkey = pubKey;
  let relayList = relays?.length ? relays : getDefaultRelays();
  const filter = {
    kinds: [30168],
    authors: [formIdPubkey],
    "#d": [formIdentifier],
  };
  console.log("attempting to fetch", pubKey, formIdentifier, "from", relayList);
  const subCloer = pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
      subCloer.close();
    },
  });
};
