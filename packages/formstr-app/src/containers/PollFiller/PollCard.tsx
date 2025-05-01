import React, { useEffect, useState } from "react";
import { Card, Modal, Progress, Typography, Button } from "antd";
import { Event } from "nostr-tools";
import { getDefaultRelays } from "../../nostr/common";
import { useMiningWorker } from "../../hooks/useMinningWorker/useMinningWorker";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { PollContent } from "./PollContent";

const { Text } = Typography;
const defaultRelays = getDefaultRelays();

interface PollCardProps {
  pollEvent: Event;
  userResponse?: Event;
}

const PollCard: React.FC<PollCardProps> = ({
  pollEvent,
  userResponse,
}) => {
  const [responses, setResponses] = useState<string[]>(
    userResponse?.tags.filter((t) => t[0] === "response")?.map((t) => t[1]) || []
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [filterPubkeys, setFilterPubkeys] = useState<string[]>([]);
  const [showPoWModal, setShowPoWModal] = useState<boolean>(false);
  const { profiles, poolRef } = useApplicationContext();
  const { pubkey } = useProfileContext();
  
  const difficulty = Number(
    pollEvent.tags.filter((t) => t[0] === "PoW")?.[0]?.[1]
  );
  const pollExpiration = pollEvent.tags.filter(
    (t) => t[0] === "endsAt"
  )?.[0]?.[1];
  
  const pollType = pollEvent.tags.find((t) => t[0] === "polltype")?.[1] || "singlechoice";
  const { minePow, cancelMining, progress } = useMiningWorker(difficulty);

  useEffect(() => {
    if (userResponse && responses.length === 0) {
      setResponses(
        userResponse.tags
          .filter((t) => t[0] === "response")
          ?.map((t) => t[1]) || []
      );
    }
  }, [pollEvent, profiles, poolRef, userResponse, responses.length]);

  const handleResponseChange = (optionValue: string) => {
    if (pollType === "singlechoice") {
      setResponses([optionValue]);
    } else if (pollType === "multiplechoice") {
      setResponses((prevResponses) =>
        prevResponses.includes(optionValue)
          ? prevResponses.filter((val) => val !== optionValue)
          : [...prevResponses, optionValue]
      );
    }
  };

  const handleSubmitResponse = async () => {
    if (!pubkey) {
      Modal.warning({
        title: 'Login Required',
        content: 'You must be logged in to vote in this poll.',
      });
      return;
    }
  
    const responseEvent = {
      kind: 1018,
      content: "",
      tags: [
        ["e", pollEvent.id],
        ...responses.map((response) => ["response", response]),
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: pubkey,
    };
    
    let useEvent = responseEvent;
    if (difficulty) {
      setShowPoWModal(true);
      let minedEvent = await minePow(responseEvent).catch((e) => {
        setShowPoWModal(false);
        return;
      });
      if (!minedEvent) return;
      useEvent = minedEvent;
    }
    setShowPoWModal(false);
  
    try {
      if (!window.nostr) {
        Modal.error({
          title: 'Nostr Extension Required',
          content: 'Please install a Nostr browser extension like nos2x or Alby to sign events.',
        });
        return;
      }

      const signedEvent = await window.nostr.signEvent(useEvent);
      
      let relays = pollEvent.tags
        .filter((t) => t[0] === "relay")
        .map((t) => t[1]);
      relays = relays.length === 0 ? defaultRelays : relays;
      
      poolRef.current.publish(relays, signedEvent);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to sign event:", error);
      Modal.error({
        title: 'Signing Failed',
        content: 'There was an error signing your response.',
      });
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  return (
    <div style={{ margin: 16 }}>
      <Card bordered={true} style={{
        boxShadow: 'none',
        border: '1px solid #f0f0f0'
      }}>
        <PollContent 
          pollEvent={pollEvent}
          showResults={showResults}
          responses={responses}
          filterPubkeys={filterPubkeys}
          difficulty={difficulty}
          pollExpiration={pollExpiration}
          handleResponseChange={handleResponseChange}
          handleSubmitResponse={handleSubmitResponse}
          toggleResults={toggleResults}
        />
      </Card>

      <Modal
        title="Computing Proof of Work"
        open={showPoWModal}
        footer={null}
        closable={false}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Progress 
            percent={Math.round((progress.maxDifficultyAchieved / difficulty) * 100)} 
            status="active" 
            strokeColor={{ from: '#108ee9', to: '#87d068' }}
          />
          <div style={{ marginTop: 16 }}>
            <Text>Mining with target difficulty: {difficulty} bits</Text>
          </div>
          <Button 
            onClick={() => {
              cancelMining();
              setShowPoWModal(false);
            }}
            style={{ marginTop: 16 }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PollCard;