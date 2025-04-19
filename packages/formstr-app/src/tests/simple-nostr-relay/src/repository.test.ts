import * as schema from "@/database";
import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { finalizeEvent, generateSecretKey, getPublicKey, verifyEvent } from "nostr-tools/pure";
import { beforeAll, describe, expect, it } from "vitest";
import { verifyDelegation } from "./nostr/nips26";
import { createRepository } from "./repository";
import type { Event } from "./types/core";
import type { DeletionEvent } from "./types/nip9";

describe("Event Repository", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let repository: ReturnType<typeof createRepository>;

  beforeAll(async () => {
    const sqlite = new Database(":memory:");
    db = drizzle(sqlite, { schema });
    await migrate(db, { migrationsFolder: "./drizzle" });
    repository = createRepository(db, { enableNIP26: true });
  });

  describe("save event", () => {
    it("should save an simplest event", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event as unknown as Event);

      const savedEvent = await repository.queryEventById(event.id);
      expect(savedEvent).toMatchObject(event);
    });
    it("should throw an error when saving duplicated event", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event as unknown as Event);

      expect(repository.saveEvent(event as unknown as Event)).rejects.toThrow();
    });
    it("should save an event with tags", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["tag1", "value1"],
            ["tag2", "value2"],
          ],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event as unknown as Event);

      const savedEvent = await repository.queryEventById(event.id);
      expect(savedEvent).toMatchObject(event);
    });
    it("should save an event with tags and rest", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["tag1", "value1", "rest1"],
            ["tag2", "value2", "rest2"],
          ],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event as unknown as Event);

      const savedEvent = await repository.queryEventById(event.id);
      expect(savedEvent).toMatchObject(event);
    });
    it("should save an event with delegation", async () => {
      const delegator = generateSecretKey();
      const delegatee = generateSecretKey();

      const delegationTokenMessage = `nostr:delegation:${getPublicKey(delegatee)}:kind=1`;
      const token = schnorr.sign(sha256(delegationTokenMessage), delegator);

      const event = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["delegation", getPublicKey(delegator), "kind=1", bytesToHex(token)]],
          content: "hello",
        },
        delegatee,
      );

      expect(verifyDelegation(event as unknown as Event)).toBe(true);

      await repository.saveEvent(event as unknown as Event);
      const savedEvent = await repository.queryEventById(event.id);
      expect(savedEvent).toMatchObject(event);

      const rawSaved = await db.query.events.findFirst({ where: eq(schema.events.id, event.id) });
      expect(rawSaved?.detegator).toBe(getPublicKey(delegator));
    });
    it("should save an replaceable event", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 2,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveReplaceableEvent(event as unknown as Event);

      const [savedEvent] = await repository.queryEventsByFilters([{ kinds: [2], authors: [getPublicKey(sk)] }]);
      expect(savedEvent).toMatchObject(event);

      const newEvent = finalizeEvent(
        {
          kind: 2,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "replaced",
        },
        sk,
      );

      await repository.saveReplaceableEvent(newEvent as unknown as Event);
      const [replacedEvent] = await repository.queryEventsByFilters([{ kinds: [2], authors: [getPublicKey(sk)] }]);
      expect(replacedEvent).toMatchObject(newEvent);

      const rawOldEvent = await db.query.events.findFirst({ where: eq(schema.events.id, event.id) });
      expect(rawOldEvent?.replaced).toBe(true);
    });
    it("should save replaceable event from multiple authors", async () => {
      const sk1 = generateSecretKey();
      const sk2 = generateSecretKey();

      const event1 = finalizeEvent(
        {
          kind: 2,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk1,
      );

      const event2 = finalizeEvent(
        {
          kind: 2,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk2,
      );

      await repository.saveReplaceableEvent(event1 as unknown as Event);
      await repository.saveReplaceableEvent(event2 as unknown as Event);

      const savedEvents = await repository.queryEventsByFilters([{ kinds: [2], authors: [getPublicKey(sk1), getPublicKey(sk2)] }]);
      expect(savedEvents).toHaveLength(2);

      const newEvent1 = finalizeEvent(
        {
          kind: 2,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "replaced",
        },
        sk1,
      );

      await repository.saveReplaceableEvent(newEvent1 as unknown as Event);

      const [replacedEvent1] = await repository.queryEventsByFilters([{ kinds: [2], authors: [getPublicKey(sk1)] }]);
      expect(replacedEvent1).toMatchObject(newEvent1);
    });
    it("should save a parameterized replaceable event", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 30000,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["d", "hoooo"]],
          content: "hello",
        },
        sk,
      );
      await repository.saveParameterizedReplaceableEvent(event as unknown as Event);

      const [savedEvent] = await repository.queryEventsByFilters([{ kinds: [30000], authors: [getPublicKey(sk)] }]);
      expect(savedEvent).toMatchObject(event);

      const newEvent = finalizeEvent(
        {
          kind: 30000,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["d", "hoooo"]],
          content: "replaced",
        },
        sk,
      );

      await repository.saveParameterizedReplaceableEvent(newEvent as unknown as Event);
      const [replacedEvent] = await repository.queryEventsByFilters([{ kinds: [30000], authors: [getPublicKey(sk)] }]);
      expect(replacedEvent).toMatchObject(newEvent);

      const rawOldEvent = await db.query.events.findFirst({ where: eq(schema.events.id, event.id) });
      expect(rawOldEvent?.replaced).toBe(true);
    });
    it("should save a parameterized replaceable event different d", async () => {
      const sk = generateSecretKey();

      const event1 = finalizeEvent(
        {
          kind: 30000,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["d", "hoooo"]],
          content: "hello",
        },
        sk,
      );

      await repository.saveParameterizedReplaceableEvent(event1 as unknown as Event);
      const [savedEvent1] = await repository.queryEventsByFilters([{ kinds: [30000], authors: [getPublicKey(sk)], "#d": ["hoooo"] }]);
      expect(savedEvent1).toMatchObject(event1);

      const event2 = finalizeEvent(
        {
          kind: 30000,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["d", "hoooo2"]],
          content: "hello",
        },
        sk,
      );

      await repository.saveParameterizedReplaceableEvent(event2 as unknown as Event);
      const [savedEvent2] = await repository.queryEventsByFilters([{ kinds: [30000], authors: [getPublicKey(sk)], "#d": ["hoooo2"] }]);
      expect(savedEvent2).toMatchObject(event2);

      const rawOldEvent = await db.query.events.findFirst({ where: eq(schema.events.id, event1.id) });
      expect(rawOldEvent?.replaced).toBe(false);

      const events = await repository.queryEventsByFilters([{ kinds: [30000], authors: [getPublicKey(sk)] }]);
      expect(events).toHaveLength(2);
    });
    it("should save a temporary event", async () => {
      const sk = generateSecretKey();
      const event = finalizeEvent(
        {
          kind: 20000,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveTemporaryEvent(event as unknown as Event);

      const savedEvents = await repository.queryEventsByFilters([{ kinds: [20000], authors: [getPublicKey(sk)] }]);
      expect(savedEvents).toHaveLength(0);
    });
  });
  describe("delete events", () => {
    it("should delete an event by e tag", async () => {
      const sk = generateSecretKey();
      const event1 = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event1 as unknown as Event);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["e", event1.id]],
          content: "delete for test",
        },
        sk,
      );
      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);

      const savedEvent = await repository.queryEventById(event1.id);
      expect(savedEvent).toBe(null);

      const rawSaved1 = await db.query.events.findFirst({ where: eq(schema.events.id, event1.id) });
      expect(rawSaved1?.hidden).toBe(true);
    });
    it("should delete an event by a tag", async () => {
      const sk = generateSecretKey();
      const event1 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event1 as unknown as Event);
      const savedEvent = await repository.queryEventById(event1.id);
      expect(savedEvent).toMatchObject(event1);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["a", `${event1.kind}:${getPublicKey(sk)}`]],
          content: "delete for test",
        },
        sk,
      );
      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);
      const deletedEvent = await repository.queryEventById(event1.id);
      expect(deletedEvent).toBe(null);
    });
    it("should delete an event by a tag with d identifier", async () => {
      const sk = generateSecretKey();
      const event1 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["d", "hoooo"]],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event1 as unknown as Event);
      const savedEvent = await repository.queryEventById(event1.id);
      expect(savedEvent).toMatchObject(event1);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["a", `${event1.kind}:${getPublicKey(sk)}:hoooo`]],
          content: "delete for test",
        },
        sk,
      );
      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);
      const deletedEvent = await repository.queryEventById(event1.id);
      expect(deletedEvent).toBe(null);
    });
    it("should delete an event by k tag", async () => {
      const sk = generateSecretKey();
      const event1 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event1 as unknown as Event);
      const savedEvent = await repository.queryEventById(event1.id);
      expect(savedEvent).toMatchObject(event1);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["k", "4"]],
          content: "delete for test",
        },
        sk,
      );
      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);
      const deletedEvent = await repository.queryEventById(event1.id);
      expect(deletedEvent).toBe(null);
    });
    it("should only delete events that public key matches", async () => {
      const sk1 = generateSecretKey();
      const sk2 = generateSecretKey();

      const event1 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk1,
      );
      await repository.saveEvent(event1 as unknown as Event);

      const event2 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk2,
      );
      await repository.saveEvent(event2 as unknown as Event);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [["k", "4"]],
          content: "delete for test",
        },
        sk1,
      );

      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);

      const deletedEvent1 = await repository.queryEventById(event1.id);
      expect(deletedEvent1).toBe(null);

      const deletedEvent2 = await repository.queryEventById(event2.id);
      expect(deletedEvent2).toMatchObject(event2);
    });
    it("should delete multiple events", async () => {
      const sk = generateSecretKey();

      const event1 = finalizeEvent(
        {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event1 as unknown as Event);

      const event2 = finalizeEvent(
        {
          kind: 4,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content: "hello",
        },
        sk,
      );
      await repository.saveEvent(event2 as unknown as Event);

      const deletionEvent = finalizeEvent(
        {
          kind: 5,
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["e", event1.id],
            ["k", "4"],
          ],
          content: "delete for test",
        },
        sk,
      );

      await repository.deleteEventsByDeletionEvent(deletionEvent as unknown as DeletionEvent);

      const deletedEvent1 = await repository.queryEventById(event1.id);
      expect(deletedEvent1).toBe(null);

      const deletedEvent2 = await repository.queryEventById(event2.id);
      expect(deletedEvent2).toBe(null);
    });
  });
  describe("query events", async () => {
    let sk1: Uint8Array;
    let sk2: Uint8Array;
    let sk3: Uint8Array;

    let sk1profile: Event;
    let event1: Event;
    let event2: Event;
    let sk2profile: Event;
    let sk3profile: Event;

    beforeAll(async () => {
      sk1 = generateSecretKey();
      sk2 = generateSecretKey();
      sk3 = generateSecretKey();

      sk1profile = finalizeEvent(
        { kind: 0, created_at: Math.floor(Date.now() / 1000) + 1, tags: [], content: JSON.stringify({ name: "sk1" }) },
        sk1,
      ) as unknown as Event;

      event1 = finalizeEvent(
        { kind: 1, created_at: Math.floor(Date.now() / 1000) + 2, tags: [["p", getPublicKey(sk2)]], content: "hello @sk2" },
        sk1,
      ) as unknown as Event;
      event2 = finalizeEvent(
        { kind: 1, created_at: Math.floor(Date.now() / 1000) + 3, tags: [["p", getPublicKey(sk3)]], content: "hello @sk3" },
        sk1,
      ) as unknown as Event;

      await repository.saveEvent(sk1profile as unknown as Event);
      await repository.saveEvent(event1 as unknown as Event);
      await repository.saveEvent(event2 as unknown as Event);

      sk2profile = finalizeEvent(
        { kind: 0, created_at: Math.floor(Date.now() / 1000) + 4, tags: [], content: JSON.stringify({ name: "sk2" }) },
        sk2,
      ) as unknown as Event;
      sk3profile = finalizeEvent(
        { kind: 0, created_at: Math.floor(Date.now() / 1000) + 5, tags: [], content: JSON.stringify({ name: "sk3" }) },
        sk3,
      ) as unknown as Event;

      await repository.saveEvent(sk2profile as unknown as Event);
      await repository.saveEvent(sk3profile as unknown as Event);
    });
    it("should query events by author", async () => {
      const events = await repository.queryEventsByFilters([{ authors: [getPublicKey(sk1)] }]);
      expect(events).toHaveLength(3);
      expect(events).toMatchObject([event2, event1, sk1profile]);
    });
    it("should query events by kind", async () => {
      const events = await repository.queryEventsByFilters([{ kinds: [0] }]);
      expect(events).toHaveLength(3);
      expect(events).toMatchObject([sk3profile, sk2profile, sk1profile]);
    });
    it("should query events by since", async () => {
      const events = await repository.queryEventsByFilters([{ since: sk1profile.created_at + 1, kinds: [0] }]);
      expect(events).toHaveLength(2);
      expect(events).toMatchObject([sk3profile, sk2profile]);
    });
    it("should query events by until", async () => {
      const events = await repository.queryEventsByFilters([{ until: sk3profile.created_at - 1, kinds: [0] }]);
      expect(events).toHaveLength(2);
      expect(events).toMatchObject([sk2profile, sk1profile]);
    });
    it("should query events by tag filter", async () => {
      const events = await repository.queryEventsByFilters([{ "#p": [getPublicKey(sk2)] }]);
      expect(events).toHaveLength(1);
      expect(events).toMatchObject([event1]);
    });
    it("should query events by multiple cond filter", async () => {
      const events = await repository.queryEventsByFilters([{ kinds: [1], authors: [getPublicKey(sk1)], "#p": [getPublicKey(sk2)] }]);
      expect(events).toHaveLength(1);
      expect(events).toMatchObject([event1]);
    });
    it("should query events by multiple filters", async () => {
      const events = await repository.queryEventsByFilters([
        { kinds: [1], authors: [getPublicKey(sk1)], "#p": [getPublicKey(sk2)] },
        { kinds: [0] },
      ]);
      expect(events).toHaveLength(4);
    });

    it("should count events by filters", async () => {
      const count = await repository.countEventsByFilters([{ kinds: [0] }]);
      expect(count).toBe(3);

      const count2 = await repository.countEventsByFilters([{ kinds: [1], authors: [getPublicKey(sk1)] }]);
      expect(count2).toBe(2);
    });
  });
});
