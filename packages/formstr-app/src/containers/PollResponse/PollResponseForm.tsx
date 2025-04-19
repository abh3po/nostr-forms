import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Dropdown,
  Avatar,
  Typography,
  Space,
  Divider,
  Modal,
  Progress,
} from "antd";
import {
  MoreOutlined,
  CopyOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Event } from "nostr-tools";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { signEvent } from "../../nostr/poll";
import { pollRelays } from "../../nostr/common";
import { openProfileTab } from "../../nostr/poll";
import { FetchResults } from "./FetchResults";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { DEFAULT_IMAGE_URL } from "../../utils/constants";
import PollComments from "../../components/Common/Comments/PollComments";
import { TextWithImages } from "../../components/Common/TextWithImages";
import Likes from "../../components/Common/Likes/likes";
import Zap from "../../components/Common/Zaps/zaps";
import { Filters } from  "./Filter";
import { bytesToHex } from "@noble/hashes/utils";
import dayjs from "dayjs";
import { useMiningWorker } from "../../hooks/useMinningWorker/useMinningWorker";
import PollTimer from "./PollTimer";
import { useProfileContext } from "../../hooks/useProfileContext";
import { useApplicationContext } from "../../hooks/useApplicationContext";

const { Text } = Typography;

interface PollResponseFormProps {
  pollEvent: Event;
  userResponse?: Event;
}

const PollResponseForm: React.FC<PollResponseFormProps> = ({
  pollEvent,
  userResponse,
}) => {
  const [responses, setResponses] = useState<string[]>(
    userResponse?.tags.filter((t) => t[0] === "response")?.map((t) => t[1]) || []
  );
  const [showResults, setShowResults] = useState<boolean>(false);
  const [filterPubkeys, setFilterPubkeys] = useState<string[]>([]);
  const [showPoWModal, setShowPoWModal] = useState<boolean>(false);
  const { profiles, poolRef, fetchUserProfileThrottled } = useApplicationContext();
  const { user, setUser } = useProfileContext();
  const difficulty = Number(
    pollEvent.tags.filter((t) => t[0] === "PoW")?.[0]?.[1]
  );
  const pollExpiration = pollEvent.tags.filter(
    (t) => t[0] === "endsAt"
  )?.[0]?.[1];
  const now = dayjs();
  const { minePow, cancelMining, progress } = useMiningWorker(difficulty);

  const pollType =
    pollEvent.tags.find((t) => t[0] === "polltype")?.[1] || "singlechoice";

  const displaySubmit = () => {
    if (showResults) return false;
    if (pollExpiration && Number(pollExpiration) * 1000 < now.valueOf())
      return false;
    return true;
  };

  useEffect(() => {
    if (userResponse && responses.length === 0) {
      setResponses(
        userResponse.tags
          .filter((t) => t[0] === "response")
          ?.map((t) => t[1]) || []
      );
    }
    if (!profiles?.has(pollEvent.pubkey)) {
      fetchUserProfileThrottled(pollEvent.pubkey);
    }
  }, [
    pollEvent,
    profiles,
    poolRef,
    fetchUserProfileThrottled,
    userResponse,
  ]);

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
    let responseUser = user;
    if (!user) {
      alert("login not found, submitting anonymously");
      let secret = generateSecretKey();
      let pubkey = getPublicKey(secret);
      responseUser = { pubkey: pubkey, privateKey: bytesToHex(secret) };
      setUser(responseUser);
    }

    const responseEvent = {
      kind: 1018,
      content: "",
      tags: [
        ["e", pollEvent.id],
        ...responses.map((response) => ["response", response]),
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: responseUser!.pubkey,
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
    const signedResponse = await signEvent(useEvent, responseUser!.privateKey);
    let relays = pollEvent.tags
      .filter((t) => t[0] === "relay")
      .map((t) => t[1]);
    relays = relays.length === 0 ? pollRelays : relays;
    let finalEvent;
    if (signedResponse) {
      finalEvent = {
        ...signedResponse,
        pubkey: responseUser!.pubkey
      };
    }
    poolRef.current.publish(relays, finalEvent!);
    setShowResults(true);
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  const copyRawEvent = async () => {
    const rawEvent = JSON.stringify(pollEvent, null, 2);
    try {
      await navigator.clipboard.writeText(rawEvent);
      alert("Event copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy event:", error);
      alert("Failed to copy raw event.");
    }
  };

  const copyPollUrl = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/respond/${pollEvent.id}`
      );
      alert("Poll URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy event:", error);
      alert("Failed to copy raw event.");
    }
  };

  const label =
    pollEvent.tags.find((t) => t[0] === "label")?.[1] || pollEvent.content;
  const options = pollEvent.tags.filter((t) => t[0] === "option");

  const menuItems = [
    {
      key: 'copyUrl',
      icon: <LinkOutlined />,
      label: 'Copy URL',
      onClick: copyPollUrl
    },
    {
      key: 'copyRaw',
      icon: <CopyOutlined />,
      label: 'Copy Raw Event',
      onClick: copyRawEvent
    }
  ];

  const hasSelectedResponse = responses.length > 0;

  return (
    <div style={{ margin: 16 }}>
      <Card>
        <Form onFinish={handleSubmitResponse}>
          <Card
            bordered
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={profiles?.get(pollEvent.pubkey)?.picture || DEFAULT_IMAGE_URL}
                  style={{ marginRight: 12, cursor: "pointer" }}
                  onClick={() => openProfileTab(nip19.npubEncode(pollEvent.pubkey))}
                />
                <div style={{ flex: 1 }}>
                  <TextWithImages content={label} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ marginRight: 16 }}>
                      Required difficulty: {difficulty || 0} bits
                    </Text>
                    <PollTimer pollExpiration={pollExpiration} />
                  </div>
                </div>
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                  <Button 
                    type="text" 
                    icon={<MoreOutlined />}
                  />
                </Dropdown>
              </div>
            }
            bodyStyle={{ padding: 16 }}
          >
            <div>
              {!showResults ? (
                pollType === "singlechoice" ? (
                  <SingleChoiceOptions
                    options={options as [string, string, string][]}
                    handleResponseChange={handleResponseChange}
                    response={responses}
                  />
                ) : pollType === "multiplechoice" ? (
                  <MultipleChoiceOptions
                    options={options as [string, string, string][]}
                    handleResponseChange={handleResponseChange}
                    response={responses}
                  />
                ) : null
              ) : (
                <FetchResults
                  pollEvent={pollEvent}
                  filterPubkeys={filterPubkeys}
                  difficulty={difficulty}
                />
              )}
            </div>

            <Divider />

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}>
              {displaySubmit() ? (
                <Button 
                  type="primary" 
                  htmlType="submit"
                  disabled={!hasSelectedResponse}
                >
                  Submit Response
                </Button>
              ) : (
                <div></div>
              )}
              <Space>
                {showResults && (
                  <Filters
                    onChange={(pubkeys: string[]) => {
                      setFilterPubkeys(pubkeys);
                    }}
                  />
                )}
                <Button onClick={toggleResults} type={showResults ? "default" : "primary"}>
                  {showResults ? "Hide Results" : "Results"}
                </Button>
              </Space>
            </div>
          </Card>
        </Form>

        <div style={{ 
          display: "flex", 
          padding: "12px 0", 
          borderTop: "1px solid #f0f0f0",
          marginTop: 12 
        }}>
          <PollComments pollEventId={pollEvent.id} />
          <Likes pollEvent={pollEvent} />
          <Zap pollEvent={pollEvent} />
        </div>
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

export default PollResponseForm;