import { Layout, Menu, Row, Col, Typography, MenuProps } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { HEADER_MENU, HEADER_MENU_KEYS } from "./config";
import { Button } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./Header.style";
import { useState } from "react";
import { normalizeURL } from "nostr-tools/utils";
import { RelayPublishModal } from "../../../../components/RelayPublishModal/RelaysPublishModal";

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
            </Row>
          </Col>
        </Row>

        <RelayPublishModal
          relays={relayList.map((r) => r.url)}
          acceptedRelays={acceptedRelays}
          isOpen={isPostPublishModalOpen}
        />
      </Header>
    </StyleWrapper>
  );
};
