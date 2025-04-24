import { EditOutlined } from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';
import { useState } from 'react';

import { useProfileContext } from '../../../../../hooks/useProfileContext';
import { isMobile } from '../../../../../utils/utility';

import { Editors } from './Editors';
import { Participants } from './Participants';

const { Text } = Typography;
export const Sharing = () => {
  const { pubkey: userPubkey, requestPubkey } = useProfileContext();
  const [isEditListOpen, setIsEditListOpen] = useState<boolean>(false);
  const [isViewListOpen, setIsViewListOpen] = useState<boolean>(false);
  return (
    <>
      <Tooltip
        title="Configure who can access this form and how?"
        trigger={isMobile() ? 'click' : 'hover'}
      >
        <div className="sharing-settings">
          <div className="property-setting">
            <Text>Configure Form Admins</Text>
            <EditOutlined
              onClick={() => {
                setIsEditListOpen(true);
              }}
            />
          </div>
          <div className="property-setting">
            <Text>Participants & Visibility</Text>
            <EditOutlined onClick={() => setIsViewListOpen(true)} />
          </div>
          <Editors open={isEditListOpen} onCancel={() => setIsEditListOpen(false)} />
          <Participants open={isViewListOpen} onCancel={() => setIsViewListOpen(false)} />
        </div>
      </Tooltip>
    </>
  );
};
