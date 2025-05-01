import { useNavigate, useParams } from "react-router-dom";
import { Filter } from "nostr-tools";
import { Event } from "nostr-tools";
import { SimplePool } from "nostr-tools";
import { getDefaultRelays } from "../../nostr/common";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { Analytics } from "./Analytics";
import { SubCloser } from "nostr-tools";

const defaultRelays = getDefaultRelays();

export const PollResults = () => {
  let { eventId } = useParams();
  const [pollEvent, setPollEvent] = useState<Event | undefined>();
  const [responses, setResponses] = useState<Event[] | undefined>();
  let navigate = useNavigate();

  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, any>();

    events.forEach((event) => {
      if (
        !eventMap.has(event.pubkey) ||
        event.created_at > eventMap.get(event.pubkey).created_at
      ) {
        eventMap.set(event.pubkey, event);
      }
    });

    return Array.from(eventMap.values());
  };

  const handleResultEvent = (event: Event) => {
    if (event.kind === 1068) {
      setPollEvent(event);
    }
    if (event.kind === 1018) {
      setResponses((prevResponses) => [...(prevResponses || []), event]);
    }
  };

  const fetchPollEvents = async () => {
    if (!eventId) {
      alert("Invalid url");
      navigate("/");
    }
    let resultFilter: Filter = {
      "#e": [eventId!],
      kinds: [1018],
    };

    let pollFilter: Filter = {
      ids: [eventId!],
    };
    let pool = new SimplePool();
    let closer = pool.subscribeMany(defaultRelays, [resultFilter, pollFilter], {
      onevent: handleResultEvent,
    });
    return closer;
  };

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (!pollEvent && !closer) {
      fetchPollEvents();
    }
    return () => {
      if (closer) closer.close();
    };
  }, [pollEvent]);

  console.log(pollEvent);

  if (pollEvent === undefined) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin tip="Loading..." size="large" />
      </div>
    );
  }

  return (
    <>
      <Analytics
        pollEvent={pollEvent}
        responses={getUniqueLatestEvents(responses || [])}
      />
    </>
  );
};