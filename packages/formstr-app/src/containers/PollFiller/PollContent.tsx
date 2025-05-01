import React from "react";
import { Button, Card, Divider, Space, Typography, Form } from "antd";
import { Event } from "nostr-tools";
import { FetchResults } from "./FetchResults";
import { SingleChoiceOptions } from "./SingleChoiceOptions";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import Timer from "../../components/Timer/expiration";
import dayjs from "dayjs";

const { Text } = Typography;

interface PollContentProps {
  pollEvent: Event;
  showResults: boolean;
  responses: string[];
  filterPubkeys: string[];
  difficulty: number;
  pollExpiration?: string;
  handleResponseChange: (optionValue: string) => void;
  handleSubmitResponse: () => void;
  toggleResults: () => void;
}

export const PollContent: React.FC<PollContentProps> = ({
  pollEvent,
  showResults,
  responses,
  filterPubkeys,
  difficulty,
  pollExpiration,
  handleResponseChange,
  handleSubmitResponse,
  toggleResults,
}) => {
  const now = dayjs();
  const pollType = pollEvent.tags.find((t) => t[0] === "polltype")?.[1] || "singlechoice";
  const label = pollEvent.tags.find((t) => t[0] === "label")?.[1] || pollEvent.content;
  const options = pollEvent.tags.filter((t) => t[0] === "option");
  const hasSelectedResponse = responses.length > 0;
  
  const displaySubmit = () => {
    if (showResults) return false;
    if (pollExpiration && Number(pollExpiration) * 1000 < now.valueOf()) return false;
    return true;
  };

  return (
    <Form onFinish={handleSubmitResponse}>
      <Card
        bordered={false}
        style={{
          boxShadow: 'none',
          marginBottom: -10
        }}
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {label}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ marginRight: 16 }}>
                  Required difficulty: {difficulty || 0} bits
                </Text>
                <Timer Expiration={pollExpiration} />
              </div>
            </div>
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
            <Button onClick={toggleResults} type={showResults ? "default" : "primary"}>
              {showResults ? "Hide Results" : "Results"}
            </Button>
          </Space>
        </div>
      </Card>
    </Form>
  );
};
