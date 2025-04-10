// eslint-disable-next-line no-restricted-globals
import {Event, getEventHash, nip13, UnsignedEvent} from "nostr-tools";
import {MiningTracker} from "../nostr/poll";

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any;
// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
    console.log("Received message in worker:", event.data);

    const { event: nostrEvent, difficulty, tracker } = event.data;

    const result = minePow(nostrEvent, difficulty, tracker);
    console.log("Mining result:", result);

});

export function minePow(
    unsigned: UnsignedEvent,
    difficulty: number,
    tracker: MiningTracker
):Omit<Event, "sig"> {
    let count = 0;
    let numHashes = 0

    const event = unsigned as Omit<Event, "sig">;
    const tag = ["nonce", count.toString(), difficulty.toString()];
    const queryTag = ["W", difficulty.toString()];

    event.tags.push(tag);
    event.tags.push(queryTag);
    let lastUpdateSent = Date.now()

    while (true) {
        const now = Math.floor(new Date().getTime() / 1000);
        if (tracker.cancelled) {
            throw new Error("Operation cancelled");
        }

        if (now !== event.created_at) {
            count = 0;
            event.created_at = now;
        }
        numHashes++;
        tag[1] = (++count).toString();
        event.id = getEventHash(event);
        let currentDifficulty = nip13.getPow(event.id);
        if (currentDifficulty > tracker.maxDifficultySoFar) {
            tracker.maxDifficultySoFar = currentDifficulty;
        }
        if (nip13.getPow(event.id) >= difficulty) {
            ctx.postMessage({status: "completed", difficulty: currentDifficulty, tracker, event})
            break;
        }
        const timeSinceLastUpdate = Date.now() - lastUpdateSent
        if(timeSinceLastUpdate > 500) {
            ctx.postMessage({status: "progress", tracker, event, numHashes})
            lastUpdateSent = Date.now()
        }
    }

    return event;
}
export default ctx