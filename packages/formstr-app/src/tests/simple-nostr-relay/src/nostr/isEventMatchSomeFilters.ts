import type { Event, SubscriptionFilter } from "../types/core";

export const isEventMatchSomeFilters = (filters: SubscriptionFilter[], event: Event): boolean => {
  return filters.some((filter) => {
    if (filter.ids && !filter.ids.includes(event.id)) return false;
    if (filter.authors && !filter.authors.includes(event.pubkey)) return false;
    if (filter.kinds && !filter.kinds.includes(event.kind)) return false;
    if (filter.since && filter.since > event.created_at) return false;
    if (filter.until && filter.until < event.created_at) return false;
    return true;
  });
};
