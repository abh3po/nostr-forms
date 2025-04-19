import { type Span, SpanStatusCode, type Tracer } from "@opentelemetry/api";
import { type Query, type SQL, type SQLWrapper, and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import * as schema from "./database";
import { getTagValuesByName } from "./nostr/utils";
import { getTracer } from "./otel";
import type { Event, SubscriptionFilter } from "./types/core";
import type { DeletionEvent } from "./types/nip9";

const tracer = getTracer();

const toInsertableEvent = (event: Event) => {
  const insertableEvent = {
    id: event.id,
    kind: event.kind,
    author: event.pubkey,
    detegator: getTagValuesByName(event, "delegation")[0] ?? null,
    sig: event.sig,
    hidden: false,
    replaced: false,
    content: event.content,
    first_seen: new Date(),
    created_at: new Date(event.created_at * 1000),
    raw: event,
  };
  const insertableTags = event.tags.map((tag) => ({
    id: uuidv7(),
    eventId: event.id,
    name: tag[0],
    value: tag[1],
    rest: tag.slice(2),
  }));

  return { insertableEvent, insertableTags };
};

const hexQueryHelper = (column: SQLiteColumn, values: string[]) =>
  or(...values.map((value) => (value.length === 64 ? eq(column, value) : like(column, `${value}%`))));

const hasDIdentifierQueryHelper = (dIdentifier: string) => {
  return sql`${schema.events.id} IN (
    SELECT DISTINCT ${schema.tags.eventId}
    FROM ${schema.tags}
    WHERE ${schema.tags.name} = 'd' AND ${schema.tags.value} = ${dIdentifier}
  )`;
};

const buildQuery = (filter: SubscriptionFilter, opt: RepositoryOptions): SQL | undefined => {
  const queries: (SQLWrapper | undefined)[] = [];
  queries.push(eq(schema.events.hidden, false));
  queries.push(eq(schema.events.replaced, false));

  if (filter.ids)
    if (filter.ids.length > 0) queries.push(hexQueryHelper(schema.events.id, filter.ids));
    else queries.push(sql`1 = 0`);
  if (filter.authors)
    if (filter.authors.length === 0) queries.push(sql`1 = 0`);
    else if (opt.enableNIP26)
      queries.push(or(hexQueryHelper(schema.events.detegator, filter.authors), hexQueryHelper(schema.events.author, filter.authors)));
    else queries.push(hexQueryHelper(schema.events.author, filter.authors));
  if (filter.kinds) queries.push(inArray(schema.events.kind, filter.kinds));
  if (filter.since) queries.push(gte(schema.events.created_at, new Date(filter.since * 1000)));
  if (filter.until) queries.push(lte(schema.events.created_at, new Date(filter.until * 1000)));

  const tagQueries = Object.entries(filter)
    .filter(([key]) => key.startsWith("#") && key.length === 2)
    .map(([tag, values]) => and(eq(schema.tags.name, tag.slice(1)), inArray(schema.tags.value, values as string[])));
  if (tagQueries.length > 0) queries.push(or(...tagQueries));

  return and(...queries);
};

type AbstractQuery = {
  toSQL: () => Query;
};

const otelEventAttributeHelper = (span: Span, event: Event) => {
  span.setAttribute("event.id", event.id);
  span.setAttribute("event.pubkey", event.pubkey);
  span.setAttribute("event.kind", event.kind);
};

const otelQueryHelper = <T extends AbstractQuery>(tracer: Tracer, eventName: string, query: T) => {
  return tracer.startActiveSpan(eventName, async (span) => {
    try {
      const sql = query.toSQL();
      span.setAttribute("sql", sql.sql);
      span.setAttribute(
        "params",
        sql.params.map((param) => JSON.stringify(param)),
      );
      span.end();
      const result = await query;
      return result;
    } catch (e) {
      span.recordException(e as Error);
      span.end();
      throw e;
    }
  });
};

export type RepositoryOptions = {
  enableNIP26?: boolean;
};

export const createRepository = (db: BetterSQLite3Database<typeof schema>, options: RepositoryOptions = {}) => ({
  saveEvent: async (event: Event): Promise<void> => {
    return tracer.startActiveSpan("repository.saveEvent", async (span) => {
      otelEventAttributeHelper(span, event);
      try {
        const { insertableEvent, insertableTags } = toInsertableEvent(event);

        await db.transaction(async (tx) => {
          await tx.insert(schema.events).values(insertableEvent);
          insertableTags.length > 0 && (await tx.insert(schema.tags).values(insertableTags));
        });
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  saveReplaceableEvent: async (event: Event): Promise<void> => {
    return tracer.startActiveSpan("repository.saveReplaceableEvent", async (span) => {
      otelEventAttributeHelper(span, event);
      try {
        const { insertableEvent, insertableTags } = toInsertableEvent(event);

        await db.transaction(async (tx) => {
          await tx
            .update(schema.events)
            .set({ replaced: true })
            .where(and(eq(schema.events.author, event.pubkey), eq(schema.events.kind, event.kind)));
          await tx.insert(schema.events).values(insertableEvent);
          insertableTags.length > 0 && (await tx.insert(schema.tags).values(insertableTags));
        });
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  saveTemporaryEvent: async (_event: Event): Promise<void> => {
    return tracer.startActiveSpan("repository.saveTemporaryEvent", async (span) => {
      span.setAttribute("event.id", _event.id);
      span.setAttribute("event.pubkey", _event.pubkey);
      span.setAttribute("event.kind", _event.kind);
      /* Do nothing */
      span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
      span.end();
    });
  },
  saveParameterizedReplaceableEvent: async (event: Event): Promise<void> => {
    return tracer.startActiveSpan("repository.saveParameterizedReplaceableEvent", async (span) => {
      otelEventAttributeHelper(span, event);
      try {
        const { insertableEvent, insertableTags } = toInsertableEvent(event);

        const d = getTagValuesByName(event, "d");
        if (d.length !== 1) throw new Error("invalid: Parameterized replaceable event should not have d tag");
        const [dIdentifier] = d;

        await db.transaction(async (tx) => {
          await tx
            .update(schema.events)
            .set({ replaced: true })
            .where(and(eq(schema.events.author, event.pubkey), eq(schema.events.kind, event.kind), hasDIdentifierQueryHelper(dIdentifier)));
          await tx.insert(schema.events).values(insertableEvent);
          insertableTags.length > 0 && (await tx.insert(schema.tags).values(insertableTags));
        });
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  deleteEventsByDeletionEvent: async (event: DeletionEvent): Promise<void> => {
    return tracer.startActiveSpan("repository.deleteEventsByDeletionEvent", async (span) => {
      otelEventAttributeHelper(span, event);
      try {
        const e = getTagValuesByName(event, "e");
        const a = getTagValuesByName(event, "a");
        const k = getTagValuesByName(event, "k");
        if (a.length === 0 && e.length === 0 && k.length === 0) return;
        span.setAttribute("filters.e", e);
        span.setAttribute("filters.a", a);
        span.setAttribute("filters.k", k);

        const authorQuery = options.enableNIP26
          ? or(eq(schema.events.author, event.pubkey), eq(schema.events.detegator, event.pubkey))
          : eq(schema.events.author, event.pubkey);

        const queries = [];
        if (e.length > 0) {
          queries.push(and(inArray(schema.events.id, e), eq(schema.events.hidden, false), authorQuery));
        }
        if (a.length > 0) {
          for (const aValue of a) {
            const [kind, , dIdentifier] = aValue.split(":");
            queries.push(
              and(
                eq(schema.events.kind, Number(kind)),
                authorQuery,
                eq(schema.events.hidden, false),
                dIdentifier ? hasDIdentifierQueryHelper(dIdentifier) : undefined,
              ),
            );
          }
        }
        if (k.length > 0) {
          queries.push(and(inArray(schema.events.kind, k.map(Number)), eq(schema.events.hidden, false), authorQuery));
        }

        const result = await db
          .update(schema.events)
          .set({ hidden: true })
          .where(or(...queries));
        span.setAttribute("result.changes", result.changes);
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  countEventsByFilters: async (filters: SubscriptionFilter[]): Promise<number> => {
    return tracer.startActiveSpan("repository.countEventsByFilters", async (span) => {
      try {
        span.setAttribute(
          "filters",
          filters.map((f) => JSON.stringify(f)),
        );
        if (filters.length === 0) return 0;
        const result = await otelQueryHelper(
          tracer,
          "repository.db.countEventsByFilters",
          db
            .select({ count: count(schema.events.id) })
            .from(schema.events)
            .leftJoin(schema.tags, eq(schema.events.id, schema.tags.eventId))
            .where(or(...filters.map((filter) => buildQuery(filter, options)))),
        );
        span.setAttribute("result.count", result[0]?.count ?? 0);
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
        return result[0]?.count ?? 0;
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  queryEventById: async (id: string): Promise<Event | null> => {
    return tracer.startActiveSpan("repository.queryEventById", async (span) => {
      try {
        const events = await otelQueryHelper(
          tracer,
          "repository.db.queryEventById",
          db
            .selectDistinct({ event: schema.events, tag: schema.tags })
            .from(schema.events)
            .leftJoin(schema.tags, eq(schema.events.id, schema.tags.eventId))
            .where(and(eq(schema.events.id, id), eq(schema.events.hidden, false))),
        );

        if (events.length === 0) return null;
        const event = events[0].event.raw as Event;
        span.setAttribute("result.id", event.id);
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
        return event;
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
  queryEventsByFilters: async (filters: SubscriptionFilter[]): Promise<Event[]> => {
    return tracer.startActiveSpan("repository.queryEventsByFilters", async (span) => {
      try {
        span.setAttribute(
          "filters",
          filters.map((f) => JSON.stringify(f)),
        );
        if (filters.length === 0) return [];

        const results = await otelQueryHelper(
          tracer,
          "repository.db.queryEventsByFilters",
          db
            .selectDistinct({ event: schema.events.raw })
            .from(schema.events)
            .leftJoin(schema.tags, eq(schema.events.id, schema.tags.eventId))
            .limit(Math.max(2000, ...filters.map((filter) => filter.limit ?? 100)))
            .where(or(...filters.map((filter) => buildQuery(filter, options))))
            .orderBy(desc(schema.events.created_at)),
        );

        span.setAttribute("result.count", results.length);
        span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
        span.end();
        return results.map((result) => result.event as Event);
      } catch (e_) {
        const e = e_ as Error;
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });
        span.end();
        throw e;
      }
    });
  },
});
