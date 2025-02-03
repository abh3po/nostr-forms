import {
  Layout,
  Menu,
  Row,
  Col,
  Typography,
  MenuProps,
  Modal,
  Spin,
} from "antd";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  MenuOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { HEADER_MENU, HEADER_MENU_KEYS } from "./config";
import { Button } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./Header.style";
import { useState } from "react";
import { normalizeURL } from "nostr-tools/utils";
import ThemeSwitch from "./ThemeSwitch";
import BB8Toggle from "./BB8Toggle";

export const CreateFormHeader: React.FC = () => {
  const [isPostPublishModalOpen, setIsPostPublishModalOpen] = useState(false);
  const [acceptedRelays, setAcceptedRelays] = useState<string[]>([]);

  const { Header } = Layout;
  const { Text } = Typography;
  const { saveForm, setSelectedTab, formSettings, relayList } =
    useFormBuilderContext();

  const onClickHandler: MenuProps["onClick"] = (e) => {
    setSelectedTab(e.key);
  };

  const handlePublishClick = async () => {
    if (!formSettings?.formId) {
      alert("Form ID is required");
      return;
    }

    setIsPostPublishModalOpen(true);
    setAcceptedRelays([]);

    try {
      await saveForm((url: string) => {
        const normalizedUrl = normalizeURL(url);
        setAcceptedRelays((prev) => [...prev, normalizedUrl]);
      });
    } catch (error) {
      console.error("Failed to publish the form", error);
    }
  };

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

  const allRelaysAccepted =
    relayList &&
    relayList.every(({ url }) => acceptedRelays.includes(normalizeURL(url)));

  return (
    <StyleWrapper>
      <Header className="create-form-header">
        <Row className="header-row" justify="space-between">
          <Col>
            <Row className="header-row" justify="space-between">
              <Col
                style={{ paddingRight: 10, paddingBottom: 4, color: "black" }}
              >
                <Link className="app-link" to="/">
                  <ArrowLeftOutlined />
                </Link>
              </Col>
              <Col>
                <Text>All Forms</Text>
              </Col>
            </Row>
          </Col>

          <Col md={8} xs={10} sm={10}>
            <Row className="header-row" justify="end">
              <Col>
                <Button
                  type="primary"
                  onClick={handlePublishClick}
                  disabled={isPostPublishModalOpen}
                >
                  Publish
                </Button>
              </Col>
              <Col md={12} xs={5} sm={2}>
                <Menu
                  mode="horizontal"
                  theme="light"
                  defaultSelectedKeys={[HEADER_MENU_KEYS.BUILDER]}
                  overflowedIndicator={<MenuOutlined />}
                  items={HEADER_MENU}
                  onClick={onClickHandler}
                />
              </Col>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ThemeSwitch />
                  <BB8Toggle />
                </div>
            </Row>
          </Col>
        </Row>

        <Modal
          title="Publishing Form"
          open={isPostPublishModalOpen}
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
      </Header>
    </StyleWrapper>
  );
};
