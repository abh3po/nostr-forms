import {
  Layout,
  Menu,
  Row,
  Col,
  Button,
  Dropdown,
  MenuProps,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import "./index.css";
import { ReactComponent as Logo } from "../../Images/formstr.svg";
import { DownOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { HEADER_MENU, HEADER_MENU_KEYS } from "./configs";
import { useProfileContext } from "../../hooks/useProfileContext";
import { NostrAvatar } from "./NostrAvatar";
import { ReactComponent as GeyserIcon } from "../../Images/Geyser.svg";
import { color } from "framer-motion";

export const NostrHeader = () => {
  const { Header } = Layout;
  const { pubkey, requestPubkey, logout } = useProfileContext();

  const dropdownMenuItems: MenuProps["items"] = [
    ...[
      pubkey
        ? {
            key: "logout",
            label: <a onClick={logout}>Logout</a>,
          }
        : {
            key: "login",
            label: <a onClick={requestPubkey}>Login</a>,
          },
    ],
    {
      key: "Support Us",
      icon: (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <GeyserIcon
            style={{
              color: "white",
              strokeWidth: 20,
              fill: "black",
              stroke: "black",
              maxHeight: 20,
              maxWidth: 20,
              backgroundColor: "black",
              marginRight: 5,
            }}
          />
          <Typography.Text style={{ marginTop: 2 }}>
            {" "}
            Support Us
          </Typography.Text>
        </div>
      ),
      onClick: () => {
        window.open("https://geyser.fund/project/formstr", "_blank");
      },
    },
  ];

  const User = {
    key: HEADER_MENU_KEYS.USER,
    icon: (
      <div>
        <Dropdown
          menu={{
            items: dropdownMenuItems,
            overflowedIndicator: null,
            style: { overflow: "auto" },
          }}
          trigger={["click"]}
        >
          <div onClick={(e) => e.preventDefault()}>
            <NostrAvatar pubkey={pubkey} /> <DownOutlined />
          </div>
        </Dropdown>
      </div>
    ),
  };
  const newHeaderMenu = [...HEADER_MENU, User];
  return (
    <>
      <Header
        className="header-style"
        style={{
          background: "white",
          borderBottom: "1px solid #ddd",
        }}
      >
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
              overflowedIndicator={<MenuOutlined />}
              items={newHeaderMenu}
            />
          </Col>
        </Row>
      </Header>
    </>
  );
};
