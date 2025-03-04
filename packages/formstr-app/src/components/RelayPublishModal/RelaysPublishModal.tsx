import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Row, Spin, Typography } from "antd";
import { normalizeURL } from "nostr-tools/utils";
import { useEffect, useState } from "react";

interface RelayPublishModal {
  relays: string[];
  acceptedRelays: string[];
  isOpen: boolean;
}

export const RelayPublishModal: React.FC<RelayPublishModal> = ({
  isOpen,
  relays,
  acceptedRelays,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const allRelaysAccepted =
    relays && relays.every((url) => acceptedRelays.includes(normalizeURL(url)));

  const { Text } = Typography;

  const renderRelays = () => {
    if (!relays) return null;

    return relays.map((url) => {
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
          <Button type="primary" onClick={() => setIsModalOpen(false)}>
            Done
          </Button>
        ) : null
      }
      closable={allRelaysAccepted}
      maskClosable={allRelaysAccepted}
      onCancel={() => setIsModalOpen(false)}
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
