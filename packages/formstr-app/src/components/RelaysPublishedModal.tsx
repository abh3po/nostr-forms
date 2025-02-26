import { CheckCircleOutlined } from "@ant-design/icons";
import { Modal, Row, Spin, Typography } from "antd";
import { normalizeURL } from "nostr-tools/utils";
import { useState } from "react";

export const RelayPublishedModal = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { Text } = Typography;

  const renderRelays = () => {
    if (!relayList) return null;

    return relayList.map(({ url }) => {
      const normalizedUrl = normalizeURL(url);
      const isAccepted = acceptedRelays.includes(normalizedUrl);

      return (
        <Row key={url} align="middle" style={{ marginBottom: 8 }}>
          {isAccepted ? (
            <CheckCircleOutlined
              style={{
                color: "#52c41a",
                marginRight: 8,
                fontSize: "16px",
              }}
            />
          ) : (
            <Spin size="small" style={{ marginRight: 8 }} />
          )}
          <Text>{url}</Text>
        </Row>
      );
    });
  };

  return (
    <Modal
      title="Publishing Form"
      open={isModalOpen}
      footer={
        allRelaysAccepted ? (
          <Button
            type="primary"
            onClick={() => setIsPostPublishModalOpen(false)}
          >
            Done
          </Button>
        ) : null
      }
      closable={allRelaysAccepted}
      maskClosable={allRelaysAccepted}
      onCancel={() => setIsPostPublishModalOpen(false)}
    >
      <div>
        <Text strong style={{ display: "block", marginBottom: 16 }}>
          Relays {allRelaysAccepted && "(Complete)"}
        </Text>
        {renderRelays()}
      </div>
    </Modal>
  );
};
