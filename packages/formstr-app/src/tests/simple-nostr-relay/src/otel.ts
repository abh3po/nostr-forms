import { trace } from "@opentelemetry/api";

export const getTracer = () => {
  const tracer = trace.getTracer("simple-nostr-relay");
  return tracer;
};
