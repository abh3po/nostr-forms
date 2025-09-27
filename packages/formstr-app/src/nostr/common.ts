import {
  Event,
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  getEventHash,
  getPublicKey,
  nip04,
  nip19,
  nip44,
  Relay,
  UnsignedEvent,
} from "nostr-tools";
import { normalizeURL } from "nostr-tools/utils";
import { Field, Response, Tag } from "./types";
import { IFormSettings } from "../containers/CreateFormNew/components/FormSettings/types";
import { signerManager } from "../signer";
import { AbstractRelay } from "nostr-tools/abstract-relay";
import { pool } from "../pool";

declare global {
  interface Window {
    __FORMSTR__FORM_IDENTIFIER__: {
      naddr?: string;
      viewKey?: string;
      formContent?: string;
    };
    nostr: any;
  }
}

const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
];

export const getDefaultRelays = () => {
  return defaultRelays;
};

function checkWindowNostr() {
  if (!window?.nostr) {
    throw Error("No method provided to access nostr");
  }
}

function toHexNpub(npubOrHex: string): string {
  try {
    // Attempt to decode npub
    const decoded = nip19.decode(npubOrHex);
    if (decoded.type !== "npub" || typeof decoded.data !== "string") {
      throw new Error("Invalid npub format");
    }
    return decoded.data;
  } catch {
    // Not a valid npub, check if it's a valid hex pubkey
    if (/^[0-9a-f]{64}$/i.test(npubOrHex)) {
      return npubOrHex;
    }
    throw new Error(`Invalid public key format: ${npubOrHex}`);
  }
}

export async function getUserPublicKey(userSecretKey: Uint8Array | null) {
  let userPublicKey;
  if (userSecretKey) {
    userPublicKey = getPublicKey(userSecretKey);
  } else {
    const signer = await signerManager.getSigner();
    checkWindowNostr();
    userPublicKey = await signer.getPublicKey();
  }
  return userPublicKey;
}

export async function signEvent(
  baseEvent: UnsignedEvent,
  userSecretKey: Uint8Array | null
) {
  console.log("INSIDE SIGNEVENT", baseEvent, userSecretKey)
  let nostrEvent;
  if (userSecretKey) {
    nostrEvent = finalizeEvent(baseEvent, userSecretKey);
  } else {
    console.log("Trying to get singer")
    const singer = await signerManager.getSigner()
    console.log("GOT SIGNER", singer)
    nostrEvent = await singer.signEvent(baseEvent);
    console.log("FINALIZED EVENT", nostrEvent)
  }
  return nostrEvent;
}

export const customPublish = (
  relays: string[],
  event: Event,
  onAcceptedRelays?: (relay: string) => void
): Promise<string>[] => {
  return relays.map(normalizeURL).map(async (url, i, arr) => {
    if (arr.indexOf(url) !== i) {
      return Promise.reject("duplicate url");
    }

    let relay: AbstractRelay | null = null;
    try {
      relay = await ensureRelay(url, { connectionTimeout: 5000 });
      return await Promise.race<string>([
        relay.publish(event).then((reason) => {
          // console.log("accepted relays", url);
          onAcceptedRelays?.(url);
          return reason;
        }),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject("timeout"), 5000)
        ),
      ]);
    } finally {
      if (relay) {
        try {
          await relay.close();
        } catch {
          // Ignore closing errors
        }
      }
    }
  });
};

function createQuestionMap(form: Tag[]) {
  const questionMap: { [key: string]: Field } = {};
  form.forEach((field) => {
    if (field[0] !== "field") return;
    questionMap[field[1]] = field as Field;
  });
  return questionMap;
}

const getDisplayAnswer = (answer: string | number | boolean, field: Field) => {
  const choices = JSON.parse(field[4]);
  return (
    choices
      ?.filter((choice: Tag) => {
        const answers = answer.toString().split(";");
        return answers.includes(choice[0]);
      })
      .map((choice: Tag) => choice[1])
      .join(", ") || (answer || "").toString()
  );
};

export const sendNotification = async (
  form: Tag[],
  response: Array<Response>
) => {
  const name = form.filter((f) => f[0] === "name")?.[0][1];
  const settings = JSON.parse(
    form.filter((f) => f[0] === "settings")?.[0][1]
  ) as IFormSettings;
  let message = 'New response for form: "' + name + '"';
  const questionMap = createQuestionMap(form);
  message += "\n" + "Answers: \n";
  response.forEach((response) => {
    if (response[0] !== "response") return;
    const question = questionMap[response[1]];
    message +=
      "\n" +
      question[3] +
      ": \n" +
      getDisplayAnswer(response[2], question) +
      "\n";
  });
  message += "Visit https://formstr.app to view the responses.";
  const newSk = generateSecretKey();
  const newPk = getPublicKey(newSk);
  settings.notifyNpubs?.forEach(async (npub) => {
    const hexNpub = toHexNpub(npub);
    const encryptedMessage = await nip04.encrypt(newSk, hexNpub, message);
    const baseKind4Event: Event = {
      kind: 4,
      pubkey: newPk,
      tags: [["p", hexNpub]],
      content: encryptedMessage,
      created_at: Math.floor(Date.now() / 1000),
      id: "",
      sig: "",
    };
    const kind4Event = finalizeEvent(baseKind4Event, newSk);
    pool.publish(defaultRelays, kind4Event);
  });
};

export const sendNRPCWebhook = async (
  form: Tag[],
  responses: Response[],
  privateKey?: Uint8Array
) => {
  console.log("Sending Webhook call");
  const settings = JSON.parse(
    form.filter((f) => f[0] === "settings")?.[0]?.[1] || "{}"
  ) as IFormSettings;

  const nrpcPubkey = settings?.nrpcPubkey;
  const nrpcMethod = settings?.nrpcMethod;
  console.log("NRPCS settings are", nrpcPubkey, nrpcMethod);
  if (!nrpcPubkey || !nrpcMethod) return; // no webhook configured

  const tags: string[][] = [
    ["p", nrpcPubkey],
    ["method", nrpcMethod],
  ];

  const questionMap = createQuestionMap(form);

  responses.forEach((r) => {
    if (r[0] !== "response") return;
    const question = questionMap[r[1]];
    if (!question) return;
    const questionText = question[3]; // same field used in sendNotification
    const answer = getDisplayAnswer(r[2], question);
    tags.push(["param", questionText, answer]);
  });

  const baseEvent: EventTemplate = {
    kind: 22068,
    tags,
    content: "",
    created_at: Math.floor(Date.now() / 1000),
  };
  console.log("WAITING TO SIGN THE EVENT  ");

  const nrpcEvent = await signEvent(
    baseEvent as UnsignedEvent,
    privateKey || null
  );
  console.log("NRPC EVENT BEFORE SENDING", nrpcEvent)
  customPublish(defaultRelays, nrpcEvent!);
  console.log("Webhook request", nrpcEvent.id);
  return nrpcEvent;
};

export const ensureRelay = async (
  url: string,
  params?: { connectionTimeout?: number }
): Promise<AbstractRelay> => {
  url = normalizeURL(url);
  const relay = new Relay(url);
  if (params?.connectionTimeout)
    relay.connectionTimeout = params.connectionTimeout;
  await relay.connect();
  return relay;
};

const encryptResponse = async (
  message: string,
  receiverPublicKey: string,
  senderPrivateKey: Uint8Array | null
) => {
  if (!senderPrivateKey) {
    const signer = await signerManager.getSigner();
    return await signer.nip44Encrypt!(receiverPublicKey, message);
  }
  const conversationKey = nip44.v2.utils.getConversationKey(
    senderPrivateKey,
    receiverPublicKey
  );
  return nip44.v2.encrypt(message, conversationKey);
};

export const sendResponses = async (
  formAuthorPub: string,
  formId: string,
  responses: Response[],
  responderSecretKey: Uint8Array | null = null,
  encryptResponses = true,
  relays: string[] = [],
  onAcceptedRelays?: (url: string) => void
) => {
  if (!formId) {
    alert("FORM ID NOT FOUND");
    return;
  }
  let responderPub;
  responderPub = await getUserPublicKey(responderSecretKey);
  let tags = [["a", `30168:${formAuthorPub}:${formId}`]];
  let content = "";
  if (!encryptResponses) {
    tags = [...tags, ...responses];
  } else {
    content = await encryptResponse(
      JSON.stringify(responses),
      formAuthorPub,
      responderSecretKey
    );
  }
  const baseEvent: UnsignedEvent = {
    kind: 1069,
    pubkey: responderPub,
    tags: tags,
    content: content,
    created_at: Math.floor(Date.now() / 1000),
  };
  const fullEvent = await signEvent(baseEvent, responderSecretKey);
  let relayList = relays;
  if (relayList.length === 0) {
    relayList = defaultRelays;
  }
  const messages = await Promise.allSettled(
    customPublish(relayList, fullEvent!, onAcceptedRelays)
  );
  console.log("Message from relays", messages);
};

//
// 1. Rumor construction
//
function buildRumor(
  serverPubkey: string,
  method: string,
  params: string[][] = []
): any {
  return {
    kind: 68,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", serverPubkey], ["method", method], ...params],
    content: "",
  };
}

//
// 2. Sealing
//
function sealRumor(
  rumor: any,
  callerSk: Uint8Array,
  serverPubkey: string
): any {
  const convKey = nip44.getConversationKey(callerSk, serverPubkey);
  const encryptedRumor = nip44.encrypt(JSON.stringify(rumor), convKey);

  return finalizeEvent(
    {
      kind: 13068,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", serverPubkey]],
      content: encryptedRumor,
    },
    callerSk
  );
}

//
// 3. Giftwrapping
//
function giftwrapSeal(
  seal: any,
  serverPubkey: string
): { giftwrap: Event; ephSk: Uint8Array } {
  const ephSk = generateSecretKey();
  const wrapConvKey = nip44.getConversationKey(ephSk, serverPubkey);
  const encryptedSeal = nip44.encrypt(JSON.stringify(seal), wrapConvKey);

  return {
    giftwrap: finalizeEvent(
      {
        kind: 21169,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", serverPubkey]],
        content: encryptedSeal,
      },
      ephSk
    ),
    ephSk,
  };
}

//
// 4. Publish
//
async function publishGiftwrap(relays: string[], giftwrap: any) {
  return Promise.allSettled(customPublish(relays, giftwrap));
}

//
// 5. Unwrapping response
//
function unwrapGiftwrap(
  resp: any,
  callerSk: Uint8Array,
  serverPubkey: string
): any {
  const sealConvKey = nip44.getConversationKey(callerSk, resp.pubkey);
  const sealJson = nip44.decrypt(resp.content, sealConvKey);
  const sealObj = JSON.parse(sealJson);

  const respConvKey = nip44.getConversationKey(callerSk, serverPubkey);
  const rumorJson = nip44.decrypt(sealObj.content, respConvKey);

  return JSON.parse(rumorJson);
}

//
// 6. Extract helpers
//
function extractResultsByType(rumorResp: any, type: string): string[][] {
  return rumorResp.tags.filter(
    (t: string[]) => t[0] === "result" && t[1] === type
  );
}

function extractMethods(rumorResp: any): string[] {
  return extractResultsByType(rumorResp, "method").map((t: string[]) => t[2]);
}

async function callRPC(
  relays: string[],
  serverPubkey: string,
  method: string,
  params: string[][] = []
): Promise<any> {
  // caller identity
  const callerSk = generateSecretKey();
  const callerPk = getPublicKey(callerSk);

  // build rumor
  const rumor = buildRumor(serverPubkey, method, params);
  rumor.pubkey = callerPk;
  rumor.id = getEventHash(rumor);

  // seal + giftwrap
  const seal = sealRumor(rumor, callerSk, serverPubkey);
  const { giftwrap } = giftwrapSeal(seal, serverPubkey);

  // publish
  await publishGiftwrap(relays, giftwrap);

  // wait for response
  return new Promise((resolve, reject) => {
    const sub = pool.subscribeMany(
      relays,
      [{ kinds: [21169], "#e": [rumor.id] }],
      {
        onevent(resp) {
          try {
            const rumorResp = unwrapGiftwrap(resp, callerSk, serverPubkey);

            if (rumorResp.kind === 69) {
              resolve(rumorResp);
              sub.close();
            }
          } catch (err) {
            console.error("Failed to decrypt response:", err);
          }
        },
        oneose() {
          // optional: reject if no response
        },
      }
    );
  });
}

export async function fetchNRPCMethods(relays: string[], serverPubkey: string) {
  const resp = await callRPC(relays, serverPubkey, "getMethods");
  return extractMethods(resp);
}
