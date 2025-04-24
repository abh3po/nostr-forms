import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Tooltip, Typography } from 'antd';
import { useState } from 'react';

import { isMobile } from '../../../../utils/utility';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';

import AddNpubStyle from './addNpub.style';

const { Text } = Typography;
export const Notifications = () => {
  const { updateFormSetting, formSettings } = useFormBuilderContext();
  const [isNewNpub, SetIsNewNpub] = useState<boolean>(false);
  const [newNpub, setNewNpub] = useState<string>('');

  const addNewNpub = () => {
    SetIsNewNpub(true);
  };

  const addToNpubList = () => {
    let existingList = formSettings.notifyNpubs || [];
    let newNpubList = new Set([...existingList, newNpub]);
    updateFormSetting({
      notifyNpubs: Array.from(newNpubList),
    });
    setNewNpub('');
    SetIsNewNpub(false);
  };
  const isValidNpub = () => {
    return newNpub.length === 63 && newNpub.startsWith('npub1');
  };

  return (
    <>
      <Tooltip
        title="Notify the given nostr profiles when a response is submitted"
        trigger={isMobile() ? 'click' : 'hover'}
      >
        <div className="property-setting">
          <Text>Add nostr npub</Text>
          <PlusOutlined onClick={addNewNpub} />
        </div>
        <ul className="npub-list">
          {formSettings.notifyNpubs?.map((npub: string) => {
            return (
              <li>
                <Text className="npub-list-text">{npub.substring(0, 10) + '...'}</Text>
              </li>
            );
          })}
        </ul>
      </Tooltip>
      <Modal
        open={isNewNpub}
        onCancel={() => {
          SetIsNewNpub(false);
        }}
        footer={null}
      >
        <AddNpubStyle className="modal-container">
          <Text> Enter the nostr npub you want to notify</Text>
          <Input
            placeholder="Enter nostr npub"
            value={newNpub}
            onChange={(e) => setNewNpub(e.target.value)}
            className="npub-input"
          />
          {newNpub && !isValidNpub() && (
            <div>
              <Text className="error-npub">this is not a valid npub</Text>
            </div>
          )}
          <Button
            type="primary"
            className="add-button"
            disabled={!isValidNpub()}
            onClick={addToNpubList}
          >
            {' '}
            Add{' '}
          </Button>
        </AddNpubStyle>
      </Modal>
    </>
  );
};
