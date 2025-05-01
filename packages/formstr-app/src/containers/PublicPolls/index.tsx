import { useEffect, useState } from "react";
import { Event } from "nostr-tools";
import { Filter } from "nostr-tools";
import { SubCloser } from "nostr-tools";
import { verifyEvent } from "nostr-tools";
import { Select, Button, Card, Space } from "antd";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { getDefaultRelays } from "../../nostr/common";
import PollCard from "../PollFiller/PollCard";
import { useProfileContext } from "../../hooks/useProfileContext";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const defaultRelays = getDefaultRelays();

// Feed component to render polls
const Feed = ({ events, userResponses }: { 
  events: Event[], 
  userResponses: Map<string, Event> 
}) => {
  const [eventIdsMap, setEventIdsMap] = useState<{ [key: string]: Event }>({});

  useEffect(() => {
    let newEventIdsMap: { [key: string]: Event } = {};
    events.forEach((event) => {
      newEventIdsMap[event.id] = event;
    });
    setEventIdsMap(newEventIdsMap);
  }, [events]);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {Object.keys(eventIdsMap)
        .sort((a, b) => {
          return eventIdsMap[b].created_at - eventIdsMap[a].created_at;
        })
        .map((eventId: string) => {
          if (eventIdsMap[eventId].kind === 1068) {
            return (
              <Card key={eventId} style={{ marginBottom: 16 }}>
                <PollCard
                  pollEvent={eventIdsMap[eventId]}
                  userResponse={userResponses.get(eventId)}
                />
              </Card>
            );
          } else {
            return null;
          }
        })}
    </Space>
  );
};

// Main component to handle data fetching and preparation
const PollFeedPage = () => {
  const navigate = useNavigate();
  const { pubkey } = useProfileContext();
  const { poolRef } = useApplicationContext();
  const [pollEvents, setPollEvents] = useState<Event[] | undefined>();
  const [userResponses, setUserResponses] = useState<Event[] | undefined>();
  const [feedSubscription, setFeedSubscription] = useState<SubCloser | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    
    if (!pollEvents) {
      setLoadingMore(false);
      return;
    }
    
    let eventIdsMap: Map<string, Event> = new Map();
    pollEvents.forEach((event) => {
      eventIdsMap.set(event.id, event);
    });
    
    let sortedEventIds = Array.from(eventIdsMap.keys()).sort((a, b) => {
      return eventIdsMap!.get(b)!.created_at - eventIdsMap!.get(a)!.created_at;
    });
    
    let lastPollEvent = eventIdsMap.get(
      sortedEventIds[sortedEventIds.length - 1]
    );
    
    let filter: Filter = {
      kinds: [1068],
      until: lastPollEvent?.created_at || Date.now() / 1000,
    };
    
    if (feedSubscription) feedSubscription.close();
    
    let newCloser = poolRef.current.subscribeMany(defaultRelays, [filter], {
      onevent: (event : Event) => {
        handleFeedEvents(event, newCloser);
        setLoadingMore(false);
      },
    });
    
    setFeedSubscription(newCloser);
  };

  const handleFeedEvents = (event: Event, closer: SubCloser) => {
    if (
      verifyEvent(event) &&
      !pollEvents?.map((event) => event.id).includes(event.id)
    ) {
      setPollEvents((prevEvents) => [...(prevEvents || []), event]);
    }
    if (pollEvents?.length || 0 >= 100) closer.close();
  };

  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, Event>();

    events.forEach((event) => {
      let pollId = event.tags.find((t) => t[0] === "e")?.[1];
      if (!pollId) return;
      if (
        !eventMap.has(pollId) ||
        event.created_at > eventMap.get(pollId)!.created_at
      ) {
        eventMap.set(pollId, event);
      }
    });
    return eventMap;
  };

  const handleResponseEvents = (event: Event) => {
    setUserResponses((prevResponses: Event[] | undefined) => [
      ...(prevResponses || []),
      event,
    ]);
  };

  const fetchFeedEvents = () => {
    const filter: Filter = {
      kinds: [1068],
      limit: 10,
    };

    let newCloser = poolRef.current.subscribeMany(defaultRelays, [filter], {
      onevent: (event: Event) => {
        handleFeedEvents(event, newCloser);
      },
    });
    return newCloser;
  };

  const fetchResponseEvents = () => {
    const filters: Filter[] = [
      {
        kinds: [1018],
        authors: [pubkey!],
        limit: 40,
      },
    ];
    let closer = poolRef.current.subscribeMany(defaultRelays, filters, {
      onevent: handleResponseEvents,
    });
    return closer;
  };

  useEffect(() => {
    if (feedSubscription) feedSubscription.close();
    if (pollEvents?.length) setPollEvents([]);
    let newCloser: SubCloser | undefined = undefined;
    newCloser = fetchFeedEvents();
    setFeedSubscription(newCloser);
    return () => {
      if (newCloser) newCloser.close();
      if (feedSubscription) feedSubscription.close();
    };
  }, [poolRef]);

  useEffect(() => {
    let closer: SubCloser | undefined;
    if (pubkey && !userResponses && poolRef && !closer) {
      closer = fetchResponseEvents();
    }
    return () => {
      if (closer) {
        closer.close();
      }
    };
  }, [pubkey, poolRef]);

  const handleGlobalChange = (value: string) => {
    if (value === 'forms') {
      navigate(ROUTES.PUBLIC_FORMS);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px', paddingTop: 0 }}>
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }}>
        <Select
          style={{ width: 240 }}
          defaultValue="polls"
          onChange={handleGlobalChange}
        >
          <Option value="forms">Global Forms</Option>
          <Option value="polls">Global Polls</Option>
        </Select>
      </div>
      
      <Feed
        events={pollEvents || []}
        userResponses={getUniqueLatestEvents(userResponses || [])}
      />
      
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Button 
          type="primary" 
          onClick={loadMore} 
          loading={loadingMore}
        >
          Load More
        </Button>
      </div>
    </div>
  );
};

export default PollFeedPage;