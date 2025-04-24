import { Divider } from 'antd';
import { forwardRef } from 'react';

import Sidebar from '../../../../components/Sidebar';
import BasicMenu from '../BasicMenu';
import InputsMenu from '../InputsMenu';
import PreBuiltMenu from '../PreBuiltMenu';

// TODO: remove usage of any here
function SidebarMenu(_props: any, ref: any) {
  return (
    <Sidebar width={252} ref={ref} className="left-sidebar">
      <BasicMenu />
      <Divider className="menu-divider" />
      <InputsMenu />
      <Divider className="menu-divider" />
      <PreBuiltMenu />
    </Sidebar>
  );
}

export default forwardRef(SidebarMenu);
