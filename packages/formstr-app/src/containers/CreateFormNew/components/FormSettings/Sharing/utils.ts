import { nip19, nip05, SimplePool } from "nostr-tools";

export const isValidNpub = (npub: string) => {
  try {
    const decoded = nip19.decode(npub);
    return decoded.type === "npub"; // Ensure it's an npub
  } catch {
    return false; // Invalid encoding or checksum
  }
};

export const isValidNip05Format = (identifier: string): boolean => {
  // nostr-tools built-in NIP05_REGEX
  return nip05.NIP05_REGEX.test(identifier);
};

export const resolveNip05 = async (identifier: string): Promise<string | null> => {
  try {
    // nostr-tools nip05.queryProfile which handles the proper fetching and parsing
    const profile = await nip05.queryProfile(identifier);

    if (profile && profile.pubkey) {
      return profile.pubkey;
    }

    return null;
  } catch (error) {
    console.error("Error resolving NIP-05 identifier:", error);
    return null;
  }
};

export const isValidIdentifier = (input: string): boolean => {
  return isValidNpub(input) || isValidNip05Format(input);
};

// NIP-50 Search Functions
export interface SearchOptions {
  query: string;
  kinds?: number[];
  domain?: string;
  language?: string;
  limit?: number;
}

export function buildSearchFilter(options: SearchOptions) {
  const filter: Record<string, any> = {};

  if (options.kinds && options.kinds.length > 0) {
    filter.kinds = options.kinds;
  }

  if (options.limit) {
    filter.limit = options.limit;
  }

  // Build search query with extensions
  let searchQuery = options.query;

  if (options.domain) {
    searchQuery += ` domain:${options.domain}`;
  }

  if (options.language) {
    searchQuery += ` language:${options.language}`;
  }

  filter.search = searchQuery.trim();

  return filter;
}

export async function performNip50Search(
  relays: string[],
  options: SearchOptions,
  timeoutMs: number = 5000
): Promise<any[]> {

  const filter = buildSearchFilter(options);
  const pool = new SimplePool();
  try {
    const results = await pool.querySync(relays, filter, { maxWait: timeoutMs });
    return results;
  } catch (e) {
    console.error("Error performing NIP-50 search:", e);
    return [];
  } finally {
    pool.close(relays);
  }
}