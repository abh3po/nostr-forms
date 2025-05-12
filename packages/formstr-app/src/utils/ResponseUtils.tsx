import { Event } from "nostr-tools";
import { getDefaultRelays } from "../nostr/common";

export const getResponseRelays = (formEvent: Event) => {
  let formRelays = formEvent.tags
    .filter((r) => r[0] === "relay")
    ?.map((r) => r[1]);
  if (formRelays.length === 0) formRelays = getDefaultRelays();
  return Array.from(new Set(formRelays));
};
