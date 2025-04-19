import React, { useEffect, useState } from "react";
import { Tooltip, Typography } from "antd";
import { ThunderboltOutlined, ThunderboltFilled } from "@ant-design/icons";
import { Event } from "nostr-tools";
import { signEvent } from "../../../nostr/poll";
import { pollRelays } from "../../../nostr/common";
import { nip57 } from "nostr-tools";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { useApplicationContext } from "../../../hooks/useApplicationContext";

const { Text } = Typography;

interface ZapProps {
  pollEvent: Event;
}

const Zap: React.FC<ZapProps> = ({ pollEvent }) => {
  const { fetchZapsThrottled, zapsMap, profiles } = useApplicationContext();
  const { user } = useProfileContext();
  const [hasZapped, setHasZapped] = useState<boolean>(false);

  useEffect(() => {
    // Fetch existing zaps for the poll event
    const fetchZaps = async () => {
      if (!zapsMap?.get(pollEvent.id)) {
        fetchZapsThrottled(pollEvent.id);
      }
      const fetchedZaps = zapsMap?.get(pollEvent.id) || [];
      const userZapped = fetchedZaps.some(
        (zap) => zap.tags.find((t) => t[0] === "P")?.[1] === user?.pubkey
      );
      setHasZapped(userZapped);
    };

    fetchZaps();
  }, [pollEvent.id, zapsMap, fetchZapsThrottled, user]);

  const getTotalZaps = () => {
    let amount = 0;
    zapsMap?.get(pollEvent.id)?.forEach((e) => {
      let zapRequestTag = e.tags.find((t) => t[0] === "description");
      if (zapRequestTag && zapRequestTag[1]) {
        const zapRequest = JSON.parse(zapRequestTag[1]);
        let requestAmount =
          zapRequest.tags.find((t: any) => t[0] === "amount")?.[1] / 1000 || 0;
        amount += requestAmount;
      }
    });
    return amount.toString();
  };

  const sendZap = async () => {
    if (!user) {
      alert("Log In to send zaps!");
      return;
    }
    let recipient = profiles?.get(pollEvent.pubkey);
    if (!recipient) {
      alert("Could not fetch recipient profile");
      return;
    }
    const zapAmount = prompt("Enter the amount to zap (in satoshis):");
    if (!zapAmount || isNaN(Number(zapAmount))) {
      alert("Invalid amount.");
      return;
    }

    let zapRequestEvent = nip57.makeZapRequest({
      profile: pollEvent.pubkey,
      event: pollEvent.id,
      amount: Number(zapAmount) * 1000,
      comment: "",
      relays: pollRelays,
    });
    let serializedZapEvent = encodeURI(
      JSON.stringify(signEvent(zapRequestEvent, user.privateKey))
    );
    let zapEndpoint = await nip57.getZapEndpoint(recipient.event);
    
    const zaprequestUrl =
      zapEndpoint +
      `?amount=${Number(zapAmount) * 1000}&nostr=${serializedZapEvent}`;

    const paymentRequest = await fetch(zaprequestUrl);
    const request = await paymentRequest.json();
    const openAppUrl = "lightning:" + request.pr;
    window.location.assign(openAppUrl);
    fetchZapsThrottled(pollEvent.id);
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <Tooltip title="Send a Zap">
        <span
          onClick={sendZap}
          style={{ 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center",
            gap: "4px"
          }}
        >
          {hasZapped ? (
            <ThunderboltFilled style={{ color: "#FAD13F", fontSize: 18 }} />
          ) : (
            <ThunderboltOutlined style={{ fontSize: 18 }} />
          )}
          {zapsMap?.get(pollEvent.id) ? (
            <Text>{getTotalZaps()}</Text>
          ) : null}
        </span>
      </Tooltip>
    </div>
  );
};

export default Zap;