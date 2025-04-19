import * as schema from "@/database";
import { isEventMatchSomeFilters } from "@/nostr/isEventMatchSomeFilters";
import { verifyEvent } from "@/nostr/verifyEvent";
import { createRepository } from "@/repository";
import type { ClientToRelayPayload, Event, ReasonMessage, RelayToClientPayload, SubscriptionFilter } from "@/types/core";
import type { RelayInfomaion } from "@/types/nip11";
import { validateClientToRelayPayload } from "@/validators/validateClientToRelayPayload";
import { validateDeletionEvent } from "@/validators/validateDeletionEvent";
import { serve } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { createNodeWebSocket } from "@hono/node-ws";
import { SpanStatusCode } from "@opentelemetry/api";
import Database from "better-sqlite3";
import { count, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { WSContext, WSEvents } from "hono/ws";
import { uuidv7 } from "uuidv7";
import { isParameterizedReplaceableEvent, isReplaceableEvent, isTemporaryEvent } from "./nostr/utils";
import { getTracer } from "./otel";
import { IndexPage } from "./pages";

const infomation: RelayInfomaion = {
  name: "Honostr Test Relay",
  description: "Honostr Test Relay",
  pubkey: "36d931a0c3e540393015c9ba9df8718b6259bf36180c9c4ef230ecc135c59c52",
  contact: "inari@inaridiy.com",
  supported_nips: [1, 2, 4, 9, 11, 45, 26],
  software: "Honostr",
  version: "0.0.0",
};

const app = new Hono();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const tracer = getTracer();

const sqlite = new Database("database.sqlite");
const db = drizzle(sqlite, { schema });
const repository = createRepository(db, { enableNIP26: true });

type Subscription = {
  connectionId: string;
  subscriptionId: string;
  filters: SubscriptionFilter[];
  onMessage: (event: Event) => void;
};

let subscirptions: Subscription[] = [];

const wsSendPayload = async (ws: WSContext, payload: RelayToClientPayload) => ws.send(JSON.stringify(payload));

const boradcastEvent = (event: Event) => {
  for (const { onMessage, filters } of subscirptions) {
    if (isEventMatchSomeFilters(filters, event)) onMessage(event);
  }
};

const processEvent = async (ws: WSContext, _connectionId: string, payload: ClientToRelayPayload<"EVENT">) => {
  return tracer.startActiveSpan("processEvent", async (span) => {
    span.setAttribute("event.id", payload[1].id);
    span.setAttribute("event.kind", payload[1].kind);
    span.setAttribute("event.author", payload[1].pubkey);

    const [_, event] = payload;
    const isValid = verifyEvent(event);
    if (!isValid) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: "invalid: event signature is invalid" });
      return wsSendPayload(ws, ["OK", event.id, false, "invalid: event signature is invalid"]);
    }

    try {
      const existingEvent = await repository.queryEventById(event.id);
      if (existingEvent) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: "duplicate: event already exists" });
        return wsSendPayload(ws, ["OK", event.id, false, "duplicate: event already exists"]);
      }

      if (isReplaceableEvent(event)) await repository.saveReplaceableEvent(event);
      else if (isTemporaryEvent(event)) await repository.saveTemporaryEvent(event);
      else if (isParameterizedReplaceableEvent(event)) await repository.saveParameterizedReplaceableEvent(event);
      else if (event.kind === 5) {
        const result = validateDeletionEvent(event);
        if (!result.success) {
          console.debug("error", payload, result.errors);
          return wsSendPayload(ws, ["OK", event.id, false, "invalid: deletion event is invalid"]);
        }
        await repository.deleteEventsByDeletionEvent(result.data);
        await repository.saveEvent(event);
      } else await repository.saveEvent(event);

      span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
      wsSendPayload(ws, ["OK", event.id, true, ""]);
      boradcastEvent(event);
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "error" });

      let message = error instanceof Error ? error.message : "error: unknown error";
      message = message.includes(":") ? message : `error: ${message}`;
      wsSendPayload(ws, ["OK", event.id, false, message as ReasonMessage]);
    } finally {
      span.end();
    }
  });
};

const processReq = async (ws: WSContext, connectionId: string, payload: ClientToRelayPayload<"REQ">) => {
  return tracer.startActiveSpan("processReq", async (span) => {
    try {
      const [_, subscriptionId, ...filters] = payload;
      span.setAttribute("subscription.id", subscriptionId);
      span.setAttribute(
        "subscription.filters",
        filters.map((filter) => JSON.stringify(filter)),
      );

      const onMessage = (event: Event) => wsSendPayload(ws, ["EVENT", subscriptionId, event]);
      subscirptions.push({ connectionId, subscriptionId, filters, onMessage });

      const events = await repository.queryEventsByFilters(filters);
      span.setAttribute("events.count", events.length);
      span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
      for (const event of events) wsSendPayload(ws, ["EVENT", subscriptionId, event]);
      wsSendPayload(ws, ["EOSE", subscriptionId]);
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "error" });
    } finally {
      span.end();
    }
  });
};

const processCount = async (ws: WSContext, _conId: string, payload: ClientToRelayPayload<"COUNT">) => {
  return tracer.startActiveSpan("processCount", async (span) => {
    try {
      const [_, subscriptionId, ...filters] = payload;
      span.setAttribute("subscription.id", subscriptionId);
      span.setAttribute(
        "subscription.filters",
        filters.map((filter) => JSON.stringify(filter)),
      );

      const count = await repository.countEventsByFilters(filters);
      span.setAttribute("count", count);
      span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
      wsSendPayload(ws, ["COUNT", subscriptionId, { count }]);
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "error" });
    } finally {
      span.end();
    }
  });
};

const closeSubscription = async (_ws: WSContext, conId: string, payload: ClientToRelayPayload<"CLOSE">) => {
  return tracer.startActiveSpan("closeSubscription", async (span) => {
    try {
      const [_, subscriptionId] = payload;
      span.setAttribute("subscription.id", subscriptionId);
      subscirptions = subscirptions.filter(({ connectionId, subscriptionId: subId }) => subId !== subscriptionId && connectionId !== conId);
      span.setStatus({ code: SpanStatusCode.OK, message: "OK" });
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: "error" });
    } finally {
      span.end();
    }
  });
};

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.all("/*", cors());

app.get(
  "/",
  upgradeWebSocket((c) => {
    return tracer.startActiveSpan("ws.connection", (span): WSEvents => {
      {
        const conId = uuidv7();
        const connInfo = getConnInfo(c);
        span.setAttribute("connection.id", conId);
        span.setAttribute("connection.remote", connInfo.remote.address ?? "unknown");

        return {
          onMessage(evt, ws) {
            return tracer.startActiveSpan("ws.onMessage", async (span) => {
              span.setAttribute("message.data", String(evt.data));
              try {
                const result = validateClientToRelayPayload(JSON.parse(evt.data as string));
                if (!result.success) return span.setStatus({ code: SpanStatusCode.ERROR, message: "invalid payload" });

                const { data: payload } = result;
                span.setAttribute("message.type", payload[0]);
                span.setAttribute("message.payload", JSON.stringify(payload));
                if (payload[0] === "EVENT") await processEvent(ws, conId, payload);
                if (payload[0] === "REQ") await processReq(ws, conId, payload);
                if (payload[0] === "CLOSE") await closeSubscription(ws, conId, payload);
                if (payload[0] === "COUNT") await processCount(ws, conId, payload);
              } catch (e) {
                span.recordException(e as Error);
                span.setStatus({ code: SpanStatusCode.ERROR, message: "error" });
              } finally {
                span.end();
              }
            });
          },
          onClose() {
            span.setAttribute("connection.close", true);
            span.end();
            subscirptions = subscirptions.filter(({ connectionId }) => connectionId !== conId);
          },
        };
      }
    });
  }),
  async (c) => {
    if (c.req.header("Accept") === "application/nostr+json") return c.json(infomation);

    const totalEvents = await db.select({ count: count() }).from(schema.events);
    const totalIndexedTags = await db.select({ count: count() }).from(schema.tags);
    const recentEvents = await db
      .select({ count: count() })
      .from(schema.events)
      .where(gt(schema.events.first_seen, new Date(Date.now() - 24 * 60 * 60 * 1000)));

    return c.html(IndexPage(totalEvents[0].count, totalIndexedTags[0].count, recentEvents[0].count));
  },
);

const server = serve({ fetch: app.fetch, port });
injectWebSocket(server);

console.log(`Server running at http://localhost:${port}`);
