import { ExportOutlined } from '@ant-design/icons';

import useDeviceType from '../../hooks/useDeviceType';

function ResponsiveLink({ link }: { link: string }) {
  const { MOBILE } = useDeviceType();
  return <a href={link}>{MOBILE ? <ExportOutlined /> : link}</a>;
}

export default ResponsiveLink;
