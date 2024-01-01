import { Layout, Menu, Row, Col, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { ROUTES } from "../../../../constants/routes";
import { HEADER_MENU, HEADER_MENU_KEYS } from "./config";
import { Button } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import StyleWrapper from "./Header.style";

export const CreateFormHeader = () => {
  const location = useLocation();
  const { Header } = Layout;
  const { Text } = Typography;

  const { saveForm } = useFormBuilderContext();

  const getSelectedTab = () => {
    if (location.pathname === ROUTES.RESPONSES) {
      return HEADER_MENU_KEYS.RESPONSES;
    }
    if (location.pathname === ROUTES.PREVIEW) {
      return HEADER_MENU_KEYS.PREVIEW;
    }
    return "";
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
                <Link className="app-link" to="/myForms">
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
                <Button type="primary" onClick={saveForm}>
                  Publish
                </Button>
              </Col>
              <Col md={10} xs={5} sm={2}>
                <Menu
                  mode="horizontal"
                  theme="light"
                  defaultSelectedKeys={[getSelectedTab()]}
                  overflowedIndicator={<MenuOutlined />}
                  items={HEADER_MENU}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Header>
    </StyleWrapper>
  );
};
