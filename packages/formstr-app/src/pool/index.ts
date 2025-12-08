import {
  EventTemplate,
  Filter,
  SimplePool,
  VerifiedEvent,
  Event,
} from "nostr-tools";
import { signerManager } from "../signer";
import { SubscribeManyParams } from "nostr-tools/abstract-pool";

export const pool = new SimplePool();

export const getOnAuthed = async () => {
  const signer = await signerManager.getSigner();
  if (signer) {
    return async (ev: EventTemplate) => {
      const signed = await signer.signEvent(ev);
      return signed as VerifiedEvent;
    };
  }
  return undefined;
};

export async function querySyncAuthed(
  relays: string[],
  filter: Filter,
  opts: { maxWait?: number } = {}
): Promise<Event[]> {
  const onauth = await getOnAuthed();

  return new Promise<Event[]>((resolve) => {
    const result: Event[] = [];

    const sub = pool.subscribeEose(relays, filter, {
      maxWait: opts.maxWait ?? 5000,
      onevent: (ev) => result.push(ev),
      onclose: () => resolve(result),
      onauth,
    } as SubscribeManyParams);
  });
}

export async function getAuthed(
  relays: string[],
  filter: Filter,
  opts: { maxWait?: number } = {}
): Promise<Event | null> {
  const events = await querySyncAuthed(relays, filter, opts);
  return events.length > 0 ? events[0] : null;
}
