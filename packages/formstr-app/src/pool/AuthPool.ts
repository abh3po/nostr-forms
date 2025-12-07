import {
  Filter,
  SimplePool,
  VerifiedEvent,
  nip42,
  type Event,
  type EventTemplate,
} from "nostr-tools";
import { signerManager } from "../signer";
import { SubCloser } from "nostr-tools/abstract-pool";

type Signer = (event: EventTemplate) => Promise<Event>;

interface AuthPoolOptions {
  getPubkey: () => string | undefined; // returns pubkey, may be undefined if not ready
  getSigner: () => Signer | undefined; // returns signer, may be undefined if not ready
}

export class AuthPool extends SimplePool {
  private getPubkey: () => string | undefined;
  private getSigner: () => Signer | undefined;

  private pending: Map<string, Event[]> = new Map();
  private patched: Set<string> = new Set();

  constructor(opts: AuthPoolOptions) {
    super();
    this.getPubkey = opts.getPubkey;
    this.getSigner = opts.getSigner;
  }

  private patchRelay(url: string) {
    const conn = (this as any)._conn;
    const relay = conn?.[url];

    if (!relay) {
      // Retry after a short delay
      setTimeout(() => this.patchRelay(url), 100);
      return;
    }

    if (this.patched.has(url)) return;
    this.patched.add(url);

    console.log("Inside patchRelay", relay, this.patched, conn);

    relay.onmessage = async (msg: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(msg.data);
      } catch {
        return;
      }

      if (!Array.isArray(data)) return;

      // AUTH challenge
      if (data[0] === "AUTH") {
        const challenge = data[1];

        const pubkey = this.getPubkey();
        const signer = this.getSigner();
        if (!pubkey || !signer) {
          // signer/pubkey not ready, retry later
          console.warn("AuthPool: signer/pubkey not ready, auth will retry");
          setTimeout(() => this.patchRelay(url), 1000);
          return;
        }

        const tmpl = nip42.makeAuthEvent(url, challenge);
        const signed = await signer({ ...tmpl });

        relay.send(JSON.stringify(["AUTH", signed]));

        // flush pending events
        const queued = this.pending.get(url);
        if (queued) {
          for (const ev of queued) relay.send(JSON.stringify(["EVENT", ev]));
          this.pending.delete(url);
        }
      }

      // NOTICE: auth-required
      if (data[0] === "NOTICE" && /auth/i.test(data[1])) {
        // relay will send AUTH next
      }
    };
  }
  override publish(
    relays: string[],
    event: Event,
    options?: {
      timeout?: number;
      onAcceptedRelays?: (relay: string) => void;
      onauth?: (ev: EventTemplate) => Promise<VerifiedEvent>;
    }
  ): Promise<string>[] {
    const timeout = options?.timeout ?? 5000;
    const onAcceptedRelays = options?.onAcceptedRelays;

    relays.forEach((url) => setTimeout(() => this.patchRelay(url), 0));

    const results = super.publish(relays, event, {
      onauth:
        options?.onauth ??
        (async (ev: EventTemplate) => {
          return (await signerManager.getSigner()).signEvent(
            ev
          ) as unknown as VerifiedEvent;
        }),
    });

    return results.map((p, i) => {
      const url = relays[i];

      // wrap with timeout
      return Promise.race([
        p.then((reason) => {
          onAcceptedRelays?.(url);
          return url; // always string
        }),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeout)
        ),
      ]).catch((err) => {
        const msg = typeof err === "string" ? err : err?.message ?? "";
        if (/auth/i.test(msg)) {
          if (!this.pending.has(url)) this.pending.set(url, []);
          this.pending.get(url)!.push(event);
        }
        return Promise.reject(err); // reject instead of returning null
      });
    });
  }

  override subscribeMany(
    relays: string[],
    filters: Filter[],
    params: {
      onevent?: (ev: Event) => void;
      oneose?: () => void;
      onclose?: () => void;
      onauth?: (evt: EventTemplate) => Promise<VerifiedEvent>;
    }
  ): SubCloser {
    relays.forEach((url) => setTimeout(() => this.patchRelay(url), 0));

    const onauth =
      params?.onauth ??
      (async (evt: EventTemplate) => {
        const signer = await signerManager.getSigner();
        return (await signer.signEvent(evt)) as unknown as VerifiedEvent;
      });

    return super.subscribeMany(relays, filters, { onauth, ...(params || {}) });
  }
}
