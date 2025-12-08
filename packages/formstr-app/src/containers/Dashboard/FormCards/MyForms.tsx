import { useEffect, useState } from "react";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { Event, SimplePool } from "nostr-tools";
import { getDefaultRelays } from "../../../nostr/common";
import { Tag } from "../../../nostr/types";
import { FormEventCard } from "./FormEventCard";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { signerManager } from "../../../signer";
import { getAuthed, pool, querySyncAuthed } from "../../../pool";

export const MyForms = () => {
  type FormEventMetadata = {
    event: Event;
    secrets: { secretKey: string; viewKey?: string };
    relay: string;
  };

  const { pubkey: userPub } = useProfileContext();
  const [refreshing, setRefreshing] = useState(false);
  const [formEvents, setFormEvents] = useState<Map<string, FormEventMetadata>>(
    new Map()
  );

  const fetchFormEvents = async (forms: Tag[], existingPool?: SimplePool) => {
    try {
      const dTags = forms.map((f) => f[1].split(":")[1]);
      const pubkeys = forms.map((f) => f[1].split(":")[0]);

      let myFormsFilter = {
        kinds: [30168],
        "#d": dTags,
        authors: pubkeys,
      };
      let myForms = await querySyncAuthed(getDefaultRelays(), myFormsFilter);

      // Create a new map to store the form events
      const newFormEvents = new Map<string, FormEventMetadata>();

      forms.forEach((formTag: Tag) => {
        const [, formData, relay, secretData] = formTag;
        const [formPubkey, formId] = formData.split(":");
        const [secretKey, viewKey] = secretData.split(":");

        const formEvent = myForms.find(
          (event: Event) => event.pubkey === formPubkey
        );

        if (formEvent) {
          const formEventMetadata: FormEventMetadata = {
            event: formEvent,
            secrets: { secretKey, viewKey },
            relay,
          };
          newFormEvents.set(formId, formEventMetadata);
        }
      });
      setFormEvents(newFormEvents);
    } catch (error) {
      console.error("Error fetching form events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchMyForms = async (existingPool?: SimplePool) => {
    if (!userPub) return;

    setRefreshing(true);

    const signer = await signerManager.getSigner();
    try {
      let existingListFilter = {
        kinds: [14083],
        authors: [userPub],
      };

      let myFormsList = await getAuthed(getDefaultRelays(), existingListFilter);

      if (!myFormsList) {
        setRefreshing(false);
        return;
      }

      let forms = await signer.nip44Decrypt!(userPub, myFormsList.content);

      await fetchFormEvents(JSON.parse(forms), pool);
    } catch (error) {
      console.error("Error fetching forms:", error);
      setRefreshing(false);
    }
  };

  const handleFormDeleted = async (
    formId: string,
    extractedFormPubkey: string
  ) => {
    if (!userPub) return;
    const signer = await signerManager.getSigner();
    setRefreshing(true);

    try {
      const existingListFilter = {
        kinds: [14083],
        authors: [userPub],
      };

      const myFormsList = await getAuthed(
        getDefaultRelays(),
        existingListFilter
      );

      if (!myFormsList) {
        console.error("No forms list found");
        return;
      }

      const forms = JSON.parse(
        await signer.nip44Decrypt!(userPub, myFormsList.content)
      );

      const updatedForms = forms.filter((f: Tag) => {
        const [formPubKey, extractedFormId] = f[1].split(":");
        return !(
          formPubKey === extractedFormPubkey && extractedFormId === formId
        );
      });

      const event = {
        kind: 14083,
        content: await signer.nip44Encrypt!(
          userPub,
          JSON.stringify(updatedForms)
        ),
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: userPub,
      };

      const signedEvent = await signer.signEvent(event);
      pool.publish(getDefaultRelays(), signedEvent, {
        onauth: getOnAuthed(),
      });
      await fetchMyForms();
    } catch (error) {
      console.error("Error handling form deletion:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userPub) {
      fetchMyForms();
    }
  }, [userPub]);

  return (
    <>
      {refreshing ? (
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#F7931A" }} spin />
          }
        />
      ) : null}
      {[...formEvents.values()]
        .sort((a, b) => b.event.created_at - a.event.created_at)
        .map((formMetadata) => {
          const formId = formMetadata.event.tags.find(
            (tag: Tag) => tag[0] === "d"
          )?.[1];

          return (
            <FormEventCard
              event={formMetadata.event}
              key={formId}
              onDeleted={() =>
                formId && handleFormDeleted(formId, formMetadata.event.pubkey)
              }
              secretKey={formMetadata.secrets.secretKey}
              viewKey={formMetadata.secrets.viewKey}
              relay={formMetadata.relay}
            />
          );
        })}
    </>
  );
};
function getOnAuthed():
  | ((
      evt: import("nostr-tools").EventTemplate
    ) => Promise<import("nostr-tools").VerifiedEvent>)
  | undefined {
  throw new Error("Function not implemented.");
}
