import { ReactNode, createContext, useRef, useState } from "react";
import { Event } from "nostr-tools";
import { Profile } from "../nostr/types";
import { SimplePool } from "nostr-tools";
import { Throttler } from "../nostr/requestThrottler";

type AppContextInterface = {
  profiles: Map<string, Profile> | undefined;
  commentsMap: Map<string, Event[]> | undefined;
  likesMap: Map<string, Event[]> | undefined;
  zapsMap: Map<string, Event[]> | undefined;
  addEventToProfiles: (event: Event) => void;
  poolRef: React.MutableRefObject<SimplePool>;
  addEventToMap: (event: Event) => void;
  fetchUserProfileThrottled: (pubkey: string) => void;
  fetchCommentsThrottled: (pollEventId: string) => void;
  fetchLikesThrottled: (pollEventId: string) => void;
  fetchZapsThrottled: (pollEventId: string) => void;
};
export const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [commentsMap, setCommentsMap] = useState<Map<string, Event[]>>(
    new Map()
  );
  const [likesMap, setLikesMap] = useState<Map<string, Event[]>>(new Map());
  const [zapsMap, setZapsMap] = useState<Map<string, Event[]>>(new Map());
  const poolRef = useRef(new SimplePool());

  const addEventToProfiles = (event: Event) => {
    if (profiles.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content);
      profiles.set(event.pubkey, { ...content, event: event });
      setProfiles(profiles);
    } catch (e) {
      console.error("Error parsing event", e);
    }
  };

  const addEventsToProfiles = (events: Event[]) => {
    events.forEach((event: Event) => {
      addEventToProfiles(event);
    });
  };

  const addEventToMap = (event: Event) => {
    let map: Map<string, Event[]>;
    let setter: React.Dispatch<React.SetStateAction<Map<string, Event[]>>>;
    if (![1, 7, 9735].includes(event.kind)) return;
    else if (event.kind === 1) {
      map = commentsMap;
      setter = setCommentsMap;
    } else if (event.kind === 7) {
      map = likesMap;
      setter = setLikesMap;
    } else if (event.kind === 9735) {
      map = zapsMap;
      setter = setZapsMap;
    }
    let pollId = event.tags.filter((t) => t[0] === "e")[0][1];
    if (
      !map!
        .get(pollId)
        ?.map((e) => e.id)
        .includes(event.id)
    ) {
      setter!(
        (prev: Map<string, Event[]>) =>
          new Map(prev.set(pollId, [...(prev.get(pollId) || []), event]))
      );
    }
  };

  const addEventsToMap = (events: Event[]) => {
    events.forEach((event: Event) => {
      addEventToMap(event);
    });
  };

  const ProfileThrottler = useRef(
    new Throttler(50, poolRef.current, addEventsToProfiles, "profiles", 500)
  );
  const CommentsThrottler = useRef(
    new Throttler(50, poolRef.current, addEventsToMap, "comments", 1000)
  );
  const LikesThrottler = useRef(
    new Throttler(50, poolRef.current, addEventsToMap, "likes", 1500)
  );

  const ZapsThrottler = useRef(
    new Throttler(50, poolRef.current, addEventsToMap, "zaps", 2000)
  );

  const fetchUserProfileThrottled = (pubkey: string) => {
    ProfileThrottler.current.addId(pubkey);
  };

  const fetchCommentsThrottled = (pollEventId: string) => {
    CommentsThrottler.current.addId(pollEventId);
  };

  const fetchLikesThrottled = (pollEventId: string) => {
    LikesThrottler.current.addId(pollEventId);
  };

  const fetchZapsThrottled = (pollEventId: string) => {
    ZapsThrottler.current.addId(pollEventId);
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        addEventToProfiles,
        commentsMap,
        poolRef,
        fetchUserProfileThrottled,
        fetchCommentsThrottled,
        addEventToMap,
        likesMap,
        fetchLikesThrottled,
        fetchZapsThrottled,
        zapsMap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
