import { Layout, Menu, Row, Col, MenuProps } from "antd";
import { Link } from "react-router-dom";
import "./index.css";
import { ReactComponent as Logo } from "../../Images/formstr.svg";
import { MenuOutlined } from "@ant-design/icons";
import { HEADER_MENU, HEADER_MENU_KEYS } from "./configs";
import { useProfileContext } from "../../hooks/useProfileContext";
import { NostrAvatar } from "./NostrAvatar";
import { ReactComponent as GeyserIcon } from "../../Images/Geyser.svg";
import { useState } from "react";
import FAQModal from "../FAQModal";

export const NostrHeader = () => {
  const { Header } = Layout;
  const { pubkey, requestPubkey, logout } = useProfileContext();
  const [isFAQModalVisible, setIsFAQModalVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  const onMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === HEADER_MENU_KEYS.HELP) {
      setIsFAQModalVisible(true);
    } else if (e.key === "supportUs") {
      window.open("https://geyser.fund/project/formstr", "_blank");
    } else if (e.key === "login") {
      requestPubkey();
    } else if (e.key === "logout") {
      logout();
    }
    setSelectedKey([e.key]);
  };

  const userMenuItems = [
    {
      key: HEADER_MENU_KEYS.USER,
      label: (
        <span style={{ display: "flex", alignItems: "center" }}>
          <NostrAvatar pubkey={pubkey} />
          <span style={{ marginLeft: 8 }}>{pubkey ? "Account" : "Guest"}</span>
        </span>
      ),
      children: [
        pubkey
          ? {
              key: "logout",
              label: "Logout",
            }
          : {
              key: "login",
              label: "Login",
            },
        {
          key: "supportUs",
          label: (
            <span style={{ display: "flex", alignItems: "center" }}>
              <GeyserIcon
                style={{
                  color: "white",
                  strokeWidth: 20,
                  fill: "black",
                  stroke: "black",
                  maxHeight: 20,
                  maxWidth: 20,
                  backgroundColor: "black",
                  marginRight: 8,
                }}
              />
              Support Us
            </span>
          ),
        },
      ],
    },
  ];

  // Combine regular menu items with user menu items
  const fullMenuItems = [...HEADER_MENU, ...userMenuItems];

  return (
    <>
      <Header
        className="header-style"
        style={{
          background: "white",
          borderBottom: "1px solid #ddd",
        }}>
        <Row className="header-row" justify="space-between">
          <Col>
            <Link className="app-link" to="/">
              <Logo />
            </Link>
          </Col>
          <Col md={8} xs={2} sm={2}>
            <Menu
              mode="horizontal"
              theme="light"
              defaultSelectedKeys={[]}
              selectedKeys={selectedKey}
              overflowedIndicator={<MenuOutlined />}
              items={fullMenuItems}
              onClick={onMenuClick}
            />
          </Col>
        </Row>
      </Header>
      <FAQModal
        visible={isFAQModalVisible}
        onClose={() => {
          setIsFAQModalVisible(false);
          setSelectedKey([]);
        }}
      />
    </>
  );
};
