import React, { useState } from "react";
import { Modal, Button, Typography, Space, Input, Tabs, message } from "antd";
import { KeyOutlined, LinkOutlined, UserOutlined } from "@ant-design/icons";
import QRCode from "qrcode.react";
import { signerManager } from "../../signer";
import { getAppSecretKeyFromLocalStorage } from "../../signer/utils";
import { getPublicKey } from "nostr-tools";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Reusable login option button
const LoginOptionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  type?: "primary" | "default";
}> = ({ icon, text, onClick, type = "default" }) => (
  <Button
    type={type}
    icon={icon}
    block
    size="large"
    onClick={onClick}
    style={{ marginBottom: 8 }}
  >
    {text}
  </Button>
);

// NIP-46 Section (Manual + QR)
const Nip46Section: React.FC = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [bunkerUri, setBunkerUri] = useState("");
  const [qrPayload] = useState(() => {
    // generate ephemeral key for demo
    const clientSecretKey = getAppSecretKeyFromLocalStorage();
    const clientPubKey = getPublicKey(clientSecretKey);
    return `nostr+connect://${clientPubKey}?relay=wss://relay.nsec.app`;
  });

  const handleConnectManual = async () => {
    if (!bunkerUri) {
      message.error("Please enter a bunker URI.");
      return;
    }
    await signerManager.loginWithNip46(bunkerUri);
    message.success(`Connected to bunker: ${bunkerUri}`);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Paste URI" key="manual">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Enter bunker URI"
              value={bunkerUri}
              onChange={(e) => setBunkerUri(e.target.value)}
            />
            <Button type="primary" onClick={handleConnectManual}>
              Connect
            </Button>
          </Space>
        </TabPane>
        <TabPane tab="QR Code" key="qr">
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <QRCode value={qrPayload} size={180} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Using relay.nsec.app for communication
              </Text>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

// Footer info component
const FooterInfo: React.FC = () => (
  <div style={{ marginTop: 24, textAlign: "center" }}>
    <Text type="secondary" style={{ fontSize: 12 }}>
      Your keys never leave your control. Formstr will never store your
      credentials.
    </Text>
    <br />
    <a href="/docs" style={{ fontSize: 12 }}>
      Need help?
    </a>
  </div>
);

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const [showNip46, setShowNip46] = useState(false);

  const handleNip07 = () => {
    if ((window as any).nostr) {
      message.success("NIP-07 extension detected. Proceeding to login...");
      signerManager.loginWithNip07();
    } else {
      message.error("No NIP-07 extension found.");
    }
  };

  const handleGuest = () => {
    message.success("Continuing as Guest.");
    // TODO: implement guest session
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={420}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Title level={4}>Sign in to Formstr</Title>
        <Text type="secondary">Choose your preferred login method</Text>
      </div>

      <Space direction="vertical" style={{ width: "100%" }}>
        <LoginOptionButton
          icon={<KeyOutlined />}
          text="Sign in with Nostr Extension (NIP-07)"
          type="primary"
          onClick={handleNip07}
        />

        <LoginOptionButton
          icon={<LinkOutlined />}
          text="Connect with Remote Signer (NIP-46)"
          onClick={() => setShowNip46(!showNip46)}
        />

        {showNip46 && <Nip46Section />}

        <LoginOptionButton
          icon={<UserOutlined />}
          text="Continue as Guest"
          onClick={handleGuest}
        />
      </Space>

      <FooterInfo />
    </Modal>
  );
};

export default LoginModal;
