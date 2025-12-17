import { Event, SimplePool } from "nostr-tools";
import { getDefaultRelays } from "./common";
import { getOnAuthed } from "../pool";

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
  const subCloer = pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
      subCloer.close();
    },
    onauth: await getOnAuthed(),
  });
};
