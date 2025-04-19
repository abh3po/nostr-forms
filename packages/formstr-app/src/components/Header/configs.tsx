import { Link } from "react-router-dom";
import { Button, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  DownOutlined,
  FormOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { ROUTES } from "../../constants/routes";

export const HEADER_MENU_KEYS = {
  PUBLIC_FORMS: "PUBLIC_FORMS",
  PUBLIC_POLLS: "PUBLIC_POLLS",
  USER: "USER",
  CREATE_FORMS: "CREATE_FORMS",
  HELP: "HELP",
  GLOBAL: "GLOBAL",
};

// Define the global dropdown menu items
const globalItems = [
  {
    key: HEADER_MENU_KEYS.PUBLIC_FORMS,
    label: <Link to={ROUTES.PUBLIC_FORMS}>Global Forms</Link>,
    icon: <FormOutlined />,
  },
  {
    key: HEADER_MENU_KEYS.PUBLIC_POLLS,
    label: <Link to={ROUTES.PUBLIC_POLLS || ROUTES.PUBLIC_FORMS}>Global Polls</Link>,
    icon: <BarChartOutlined />,
  },
];

export const HEADER_MENU = [
  {
    key: HEADER_MENU_KEYS.HELP,
    label: "Help",
    icon: <InfoCircleOutlined />,
  },
  {
    key: HEADER_MENU_KEYS.GLOBAL,
    label: (
      <Dropdown 
        overlay={<Menu items={globalItems} />} 
        placement="bottomCenter"
      >
        <span style={{ cursor: "pointer" }}>
          Global <DownOutlined />
        </span>
      </Dropdown>
    ),
    icon: <SearchOutlined />,
  },
  {
    key: HEADER_MENU_KEYS.CREATE_FORMS,
    label: (
      <Button
        type="primary"
        icon={<PlusOutlined style={{ paddingTop: "2px" }} />}
      >
        Create Form
      </Button>
    ),
  },
];