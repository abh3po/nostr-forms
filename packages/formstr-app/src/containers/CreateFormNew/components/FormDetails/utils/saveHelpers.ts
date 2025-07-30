import { SimplePool, UnsignedEvent } from "nostr-tools";
import {
  getItem,
  LOCAL_STORAGE_KEYS,
  setItem,
} from "../../../../../utils/localStorage";
import { ILocalForm } from "../../../providers/FormBuilder/typeDefs";
import { getDefaultRelays } from "../../../../../nostr/common";
import { KINDS, Tag } from "../../../../../nostr/types";

export const saveToDevice = (
  formAuthorPub: string,
  formAuthorSecret: string,
  formId: string,
  name: string,
  relays: string[],
  callback: () => void,
  viewKey?: string
) => {
  let saveObject: ILocalForm = {
    key: `${formAuthorPub}:${formId}`,
    publicKey: `${formAuthorPub}`,
    privateKey: `${formAuthorSecret}`,
    name: name,
    formId: formId,
    relay: relays[0],
    relays: relays,
    createdAt: new Date().toString(),
  };
  if (viewKey) saveObject.viewKey = viewKey;
  let forms = getItem<Array<ILocalForm>>(LOCAL_STORAGE_KEYS.LOCAL_FORMS) || [];
  const existingKeys = forms.map((form) => form.key);
  if (existingKeys.includes(saveObject.key)) {
    callback();
    return;
  }
  forms.push(saveObject);
  setItem(LOCAL_STORAGE_KEYS.LOCAL_FORMS, forms);
  callback();
};

type SetupResult = {
  status: "exists" | "ready";
  forms: Tag[];
};

export const saveToMyForms = async (
  formAuthorPub: string,
  formAuthorSecret: string,
  formId: string,
  relays: string[],
  userPub: string,
  callback: (state: "saving" | "saved" | null) => void,
  viewKey?: string
) => {
  if (!userPub) return;

  callback("saving");
  const pool = new SimplePool();
  const newRelays = relays && relays.length !== 0 ? relays : getDefaultRelays();

  try {
    if (!window.nostr) {
      throw new Error("Nostr client not available");
    }

    const setupWithTimeout = async (): Promise<SetupResult> => {
      return new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Setup timed out after 15s"));
        }, 10000);

        try {
          const existingList = await pool.querySync(newRelays, {
            kinds: [KINDS.myFormsList],
            authors: [userPub],
          });

          let forms: Tag[] = [];
          if (existingList[0]) {
            const formsString = await window.nostr.nip44.decrypt(
              userPub,
              existingList[0].content
            );
            forms = JSON.parse(formsString);
          }

          const key = `${formAuthorPub}:${formId}`;
          if (forms.map((f) => f[1]).includes(key)) {
            console.log("Form already exists in your saved forms");
            clearTimeout(timeoutId);
            resolve({ status: "exists", forms });
            return;
          }

          clearTimeout(timeoutId);
          resolve({ status: "ready", forms });
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    };

    const setupResult = await setupWithTimeout();

    if (setupResult.status === "exists") {
      callback("saved");
      return;
    }

    let secrets = `${formAuthorSecret}`;
    if (viewKey) secrets = `${secrets}:${viewKey}`;

    const forms = setupResult.forms;
    forms.push(["f", `${formAuthorPub}:${formId}`, relays[0], secrets]);

    const encryptedString = await window.nostr.nip44.encrypt(
      userPub,
      JSON.stringify(forms)
    );

    const myFormEvent: UnsignedEvent = {
      kind: KINDS.myFormsList,
      content: encryptedString,
      pubkey: userPub,
      tags: [],
      created_at: Math.round(Date.now() / 1000),
    };

    const signedEvent = await window.nostr.signEvent(myFormEvent);
    await Promise.allSettled(pool.publish(relays, signedEvent));

    callback("saved");
  } catch (error) {
    console.error("Failed to save to nostr:", error);
    callback(null);
  } finally {
    pool.close(relays);
  }
};
