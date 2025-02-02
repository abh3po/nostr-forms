import { Link } from "react-router-dom";
import { Button } from "antd";
import { SearchOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";
import { MY_FORM_MENU } from "../../old/containers/MyForms/configs/menuConfig";
import { isMobile } from "../../utils/utility";
import { ROUTES } from "../../constants/routes";

export const HEADER_MENU_KEYS = {
  PUBLIC_FORMS: "PUBLIC_FORMS",
  MY_FORMS: "MY_FORMS",
  CREATE_FORMS: "CREATE_FORMS",
};

export const HEADER_MENU = [
  {
    key: HEADER_MENU_KEYS.PUBLIC_FORMS,
    label: "Global Forms",
    icon: (
      <Link to={ROUTES.PUBLIC_FORMS}>
        <SearchOutlined />
      </Link>
    ),
  },
  {
    key: HEADER_MENU_KEYS.CREATE_FORMS,
    label: (
      <Button
        type="primary"
        icon={<PlusOutlined style={{ paddingTop: "2px" }} />}
      >
        <Link to={ROUTES.CREATE_FORMS_NEW}>Create Form</Link>
      </Button>
    ),
  },
];
