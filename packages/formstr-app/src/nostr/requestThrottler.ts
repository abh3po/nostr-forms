import { SimplePool } from "nostr-tools";
import { fetchComments, fetchLikes, fetchUserProfiles, fetchZaps } from "./poll";
import { Event } from "nostr-tools";

type QueueType = "profiles" | "comments" | "likes" | "zaps";

export class Throttler {
  private queue: string[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private limit: number;
  private pool: SimplePool;
  private callback: (events: Event[]) => void;
  private queueType: QueueType;
  private delay: number;

  constructor(
    limit: number,
    pool: SimplePool,
    callback: (events: Event[]) => void,
    queueType: QueueType,
    delay?: number
  ) {
    this.limit = limit;
    this.pool = pool;
    this.callback = callback;
    this.queueType = queueType;
    this.delay = delay || 1000;
  }

  public addId(pubkey: string) {
    if (!this.queue.includes(pubkey)) {
      this.queue.push(pubkey);
      this.startProcessing();
    }
  }

  private startProcessing() {
    if (this.intervalId) return; // Already processing

    this.intervalId = setInterval(() => {
      this.processQueue();
    }, this.delay); // Process every second
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      clearInterval(this.intervalId!);
      this.intervalId = null;
      return;
    }
    let results: Event[] = [];
    const IdsToProcess = this.queue.splice(0, this.limit);
    if (this.queueType === "profiles") {
      results = await fetchUserProfiles(IdsToProcess, this.pool);
    }
    if (this.queueType === "comments") {
      results = await fetchComments(IdsToProcess, this.pool);
    }
    if (this.queueType === "likes") {
      results = await fetchLikes(IdsToProcess, this.pool);
    }

    if (this.queueType === "zaps") {
      results = await fetchZaps(IdsToProcess, this.pool);
    }

    this.callback(results);
  }
}
