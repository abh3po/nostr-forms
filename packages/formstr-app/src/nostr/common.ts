import {
  AbstractRelay,
  Event,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip04,
  nip19,
  nip44,
  Relay,
  SimplePool,
  UnsignedEvent,
} from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import { normalizeURL } from "nostr-tools/utils";
import { Field, Response, Tag } from "./types";
import { IFormSettings } from "../containers/CreateFormNew/components/FormSettings/types";
import { Alert } from "antd";

declare global {
  // TODO: make this better
  interface Window {
    nostr: {
      getPublicKey: () => Promise<string>;
      signEvent: <Event>(
        event: Event
      ) => Promise<Event & { id: string; sig: string }>;
      nip04: {
        encrypt: (pubKey: string, message: string) => Promise<string>;
        decrypt: (pubkey: string, message: string) => Promise<string>;
      };
      nip44: {
        encrypt: (pubKey: string, message: string) => Promise<string>;
        decrypt: (pubkey: string, mssage: string) => Promise<string>;
      };
    };
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

export async function getUserPublicKey(userSecretKey: Uint8Array | null) {
  let userPublicKey;
  if (userSecretKey) {
    userPublicKey = getPublicKey(userSecretKey);
  } else {
    checkWindowNostr();
    userPublicKey = await window.nostr.getPublicKey();
  }
  return userPublicKey;
}

export async function signEvent(
  baseEvent: UnsignedEvent,
  userSecretKey: Uint8Array | null
) {
  let nostrEvent;
  if (userSecretKey) {
    nostrEvent = finalizeEvent(baseEvent, userSecretKey);
  } else {
    checkWindowNostr();
    nostrEvent = await window.nostr.signEvent(baseEvent);
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
  let choices = JSON.parse(field[4]);
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
  let settings = JSON.parse(
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
  const pool = new SimplePool();
  settings.notifyNpubs?.forEach(async (npub) => {
    const hexNpub = nip19.decode(npub).data.toString();
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
  pool.close(defaultRelays);
};

export const ensureRelay = async (
  url: string,
  params?: { connectionTimeout?: number }
): Promise<AbstractRelay> => {
  url = normalizeURL(url);
  let relay = new Relay(url);
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
    return await window.nostr.nip44.encrypt(receiverPublicKey, message);
  }
  let conversationKey = nip44.v2.utils.getConversationKey(
    bytesToHex(senderPrivateKey),
    receiverPublicKey
  );
  return nip44.v2.encrypt(message, conversationKey);
};

export const sendResponses = async (
  formAuthorPub: string,
  formId: string,
  responses: Response[],
  responderSecretKey: Uint8Array | null = null,
  encryptResponses: boolean = true,
  relays: string[] = [],
  onAcceptedRelays?: (url: string) => void
) => {
  if(!formId) {
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
    customPublish(relayList, fullEvent, onAcceptedRelays)
  );
  console.log("Message from relays", messages);
};
