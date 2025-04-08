import { Link } from "react-router-dom";
import GradientCreateFormButton from "./GradientCreateFormButton";
import { SearchOutlined, InfoCircleOutlined,} from "@ant-design/icons";
import { ROUTES } from "../../constants/routes";

export const HEADER_MENU_KEYS = {
  PUBLIC_FORMS: "PUBLIC_FORMS",
  USER: "USER",
  CREATE_FORMS: "CREATE_FORMS",
  HELP: "HELP",
};

export const HEADER_MENU = [
  {
    key: HEADER_MENU_KEYS.HELP,
    label: "Help",
    icon: <InfoCircleOutlined />,
  },
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
    label: <GradientCreateFormButton />,
  },
];
