// import { SimplePool, getEventHash, signEvent } from "nostr-tools";
// import type { NormalizedForm, ResponseSubmission } from "./types";

// /**
//  * Submit a response to a NIP-101 form
//  * @param form - normalized form
//  * @param values - object mapping fieldId -> value
//  * @param signer - function to sign events: (event) => signedEvent
//  * @param relays - array of relay URLs
//  */
// export async function submitResponse(
//   form: NormalizedForm,
//   values: ResponseSubmission,
//   signer: (event: any) => Promise<any>,
//   relays: string[],
// ) {
//   const tags = Object.entries(values).map(([fieldId, value]) => [
//     "response",
//     fieldId,
//     Array.isArray(value) ? value.join(";") : value,
//     "{}",
//   ]);

//   const event = {
//     kind: 1069,
//     pubkey: form.pubkey, // submitter pubkey can also be used here
//     created_at: Math.floor(Date.now() / 1000),
//     tags: [["a", `30168:${form.pubkey}:${form.id}`], ...tags],
//     content: "",
//   };

//   event.id = getEventHash(event);
//   const signed = await signer(event);

//   // publish
//   const pool = new SimplePool();
//   const pubPromises = relays.map((url) => pool.publish(url, signed));
//   await Promise.all(pubPromises);

//   return signed;
// }
