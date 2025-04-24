import { Menu } from 'antd';

import { BASIC_MENU } from '../../configs/menuConfig';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';

function BasicMenu() {
  const { addQuestion } = useFormBuilderContext();

  const onMenuClick = ({ key }: { key: string }) => {
    const selectedItem = BASIC_MENU.find((item) => item.key === key);
    addQuestion(selectedItem?.primitive, undefined, selectedItem?.answerSettings);
  };

  const items = [{ key: 'Basic', label: 'Basic', children: BASIC_MENU, type: 'group' }];
  return <Menu selectedKeys={[]} items={items} onClick={onMenuClick} />;
}

export default BasicMenu;
