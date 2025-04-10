import { useEffect, useState } from "react";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { pollRelays } from "../../nostr/common";
import { Event } from "nostr-tools";
import { Notes } from ".";
import { Button, Typography } from "antd";

const { Text } = Typography;

interface PrepareNoteInterface {
  eventId: string;
}

export const PrepareNote: React.FC<PrepareNoteInterface> = ({ eventId }) => {
  let { poolRef } = useApplicationContext();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async (id: string) => {
      const filter = {
        ids: [id],
      };
      let result = await poolRef.current.get(pollRelays, filter);
      setEvent(result);
    };
    if (eventId && !event) {
      fetchEvent(eventId);
    }
  }, [eventId, poolRef, event]);

  if (event) return <Notes event={event} />;
  else
    return (
      <Text style={{ fontSize: 10 }}>
        <Button 
          type="link"
          onClick={() => {
            window.open(`/respond/${eventId}`, "_blank noreferrer");
          }}
        >
          {eventId}
        </Button>
      </Text>
    );
};