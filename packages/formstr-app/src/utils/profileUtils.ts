import type { SimplePool } from "nostr-tools";

export interface ProfileInfo {
    lud16?: string;
    name?: string;
    picture?: string;
    displayName?: string;
}

export const fetchProfiles = async (
    pubkeys: string[],
    pool: SimplePool,
    relays: string[]
): Promise<Map<string, ProfileInfo>> => {
    const profiles = new Map<string, ProfileInfo>();
    if (!pubkeys.length) return profiles;

    try {
        const events = await pool.querySync(
            relays,
            { kinds: [0], authors: pubkeys },
            { maxWait: 3000 }
        );

        for (const event of events) {
            try {
                const content = JSON.parse(event.content);
                profiles.set(event.pubkey, {
                    lud16: content.lud16 || content.lightning,
                    name: content.name,
                    picture: content.picture,
                    displayName: content.display_name || content.displayName
                });
            } catch (e) {
                console.error("Failed to parse profile content", e);
            }
        }
    } catch (error) {
        console.error("Error fetching profiles:", error);
    }

    return profiles;
};

