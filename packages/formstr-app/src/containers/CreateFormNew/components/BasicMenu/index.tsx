import { Menu } from "antd";
import { BASIC_MENU } from "../../configs/menuConfig";
import { BASIC_MENU_KEYS } from "../../configs/constants";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";

function BasicMenu() {
  const { addQuestion, addSection } = useFormBuilderContext();

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === BASIC_MENU_KEYS.SECTION) {
      addSection("New Section", "Click to edit section description");
      return;
    }
    
    const selectedItem = BASIC_MENU.find((item) => item.key === key);
    addQuestion(
      selectedItem?.primitive,
      undefined,
      selectedItem?.answerSettings
    );
  };

  const items = [
    { key: "Basic", label: "Basic", children: BASIC_MENU, type: "group" },
  ];
  return <Menu selectedKeys={[]} items={items} onClick={onMenuClick} />;
}

export default BasicMenu;
