import { Table, Card } from "antd";
import { Event } from "nostr-tools";
import { useEffect } from "react";
import { useAppContext } from "../../hooks/useAppContext/useAppContext";
import OverlappingAvatars from "../../components/Common/OverlappingAvatars";
import { TextWithImages } from "../../components/Common/TextWithImages";

interface AnalyticsProps {
  pollEvent: Event;
  responses: Event[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  pollEvent,
  responses,
}) => {
  const label =
    pollEvent.tags.find((t) => t[0] === "label")?.[1] || pollEvent.content;
  const options = pollEvent.tags.filter((t) => t[0] === "option");

  const { profiles, fetchUserProfileThrottled } = useAppContext();

  useEffect(() => {
    responses.forEach((event) => {
      const responderId = event.pubkey;
      if (!profiles?.get(responderId)) {
        fetchUserProfileThrottled(responderId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateResults = () => {
    const results: { count: number; responders: Set<string> }[] = options.map(
      () => ({ count: 0, responders: new Set<string>() })
    );
    // Count responses from events
    responses.forEach((event) => {
      const responderId = event.pubkey; // Assuming event.pubkey holds the user ID
      event.tags.forEach((tag: string[]) => {
        if (tag[0] === "response") {
          const optionId = tag[1];
          const responseIndex = options.findIndex(
            (optionTag) => optionTag[1] === optionId
          );
          if (responseIndex !== -1) {
            if (!results[responseIndex].responders.has(responderId)) {
              results[responseIndex].count++;
              results[responseIndex].responders.add(responderId);
            }
          }
        }
      });
    });
    return results;
  };
  const results = calculateResults();

  const calculatePercentages = (counts: number[]) => {
    const total = counts.reduce((acc, count) => acc + count, 0);
    return counts.map((count) => ((count / total) * 100).toFixed(2));
  };

  const columns = [
    {
      title: 'Option',
      dataIndex: 'option',
      key: 'option',
      render: (text: string) => <TextWithImages content={text} />
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text: string) => `${text}%`
    },
    {
      title: 'Responders',
      dataIndex: 'responders',
      key: 'responders',
      render: (responders: string[]) => (
        <OverlappingAvatars ids={responders} maxAvatars={2} />
      )
    }
  ];

  const dataSource = options.map((option, index) => {
    const responders = Array.from(results[index].responders);
    return {
      key: index,
      option: option[2],
      percentage: calculatePercentages(results.map((r) => r.count))[index],
      responders: responders
    };
  });

  return (
    <Card title={label}>
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false}
        aria-label={`Results for "${label}"`}
      />
    </Card>
  );
};