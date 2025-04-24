import { Layout } from 'antd';
import { forwardRef } from 'react';

import StyledWrapper from './style';

function Sidebar(
  {
    className,
    width,
    children,
  }: {
    className?: string;
    width: number;
    children: React.ReactNode;
  },
  ref: any,
) {
  return (
    <StyledWrapper ref={ref} className={className}>
      <Layout.Sider className="create-sidebar" width={width}>
        {children}
      </Layout.Sider>
    </StyledWrapper>
  );
}

export default forwardRef(Sidebar);
