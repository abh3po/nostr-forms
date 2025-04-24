import { Menu } from 'antd';

import { INPUTS_MENU } from '../../configs/menuConfig';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';

function InputsMenu() {
  const { addQuestion } = useFormBuilderContext();

  const onMenuClick = ({ key }: { key: string }) => {
    const selectedItem = INPUTS_MENU.find((item) => item.key === key);
    addQuestion(selectedItem?.primitive, undefined, selectedItem?.answerSettings);
    console.log('after add question');
  };

  const items = [{ key: 'Inputs', label: 'Inputs', children: INPUTS_MENU, type: 'group' }];
  return <Menu selectedKeys={[]} items={items} onClick={onMenuClick} />;
}

export default InputsMenu;
