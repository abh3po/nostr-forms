import { getDefaultRelays } from '@formstr/sdk';
import { Button, Input, Modal, Typography } from 'antd';
import { Event, SimplePool, UnsignedEvent } from 'nostr-tools';
import { FC, useState } from 'react';

import { Actions, NIP07Interactions } from '../../../components/NIP07Interactions';
import { useProfileContext } from '../../../hooks/useProfileContext';

const { Text } = Typography;

interface RequestAccessProps {
  pubkey: string;
  formId: string;
}

export const RequestAccess: FC<RequestAccessProps> = ({ pubkey, formId }) => {
  const [message, setMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { pubkey: userPubkey, requestPubkey } = useProfileContext();

  const createRequestEvent = (userPubkey: string): UnsignedEvent => {
    return {
      kind: 202,
      content: message,
      tags: [
        ['a', `30168:${pubkey}:${formId}`],
        ['accessType', 'vote'],
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: userPubkey,
    };
  };

  if (showMessageModal && !pubkey) {
    requestPubkey();
  }
  const publishEvent = async (event: Event) => {
    const pool = new SimplePool();
    let relays = getDefaultRelays();
    await Promise.allSettled(pool.publish(relays, event));
    pool.close(relays);
  };

  return (
    <>
      <Button
        onClick={() => {
          setShowMessageModal(true);
        }}
      >
        Request Access
      </Button>
      <Modal
        open={showMessageModal}
        onCancel={() => setShowMessageModal(false)}
        onOk={() => setShowMessageModal(false)}
        closable={false}
      >
        <Text> Enter the request message you want to send to the admins </Text>
        <Input
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setMessage(event.target.value);
          }}
        />
      </Modal>
      {!showMessageModal && userPubkey && !!message && (
        <NIP07Interactions
          action={Actions.SIGN_EVENT}
          event={createRequestEvent(userPubkey)}
          ModalMessage={''}
          callback={function (event: string | Event): void {
            setShowMessageModal(false);
            publishEvent(event as Event);
          }}
        />
      )}
    </>
  );
};
