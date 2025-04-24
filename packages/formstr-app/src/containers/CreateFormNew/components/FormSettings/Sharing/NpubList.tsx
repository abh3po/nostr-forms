import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Typography } from 'antd';
import { nip19 } from 'nostr-tools';
import { ReactNode, useState } from 'react';

import AddNpubStyle from '../addNpub.style';

import { isValidNpub } from './utils';

interface NpubListProps {
  NpubList: Set<string> | null;
  setNpubList: (npubs: Set<string>) => void;
  ListHeader: string;
}

export const NpubList: React.FC<NpubListProps> = ({ setNpubList, NpubList, ListHeader }) => {
  const [newNpub, setNewNpub] = useState<string>();

  const removeParticipant = (participant: string) => {
    const updatedList = new Set(NpubList);
    updatedList.delete(participant);
    setNpubList(updatedList);
  };

  const renderList = () => {
    const elements: ReactNode[] = [];
    (NpubList || new Set()).forEach((value: string, key: string, set: Set<string>) => {
      elements.push(
        <li>
          <Typography.Text>{nip19.npubEncode(value).substring(0, 10) + '...'}</Typography.Text>
          <Button
            type="link"
            icon={<CloseCircleOutlined />}
            onClick={() => removeParticipant(value)}
            style={{ marginLeft: '10px' }} // Some margin for better spacing
          />
        </li>,
      );
    });
    return <ul>{elements}</ul>;
  };

  return (
    <div>
      <AddNpubStyle className="modal-container">
        <Typography.Text
          style={{
            fontSize: 18,
          }}
        >
          {ListHeader}
        </Typography.Text>
        <Divider />
        {renderList()}
        <Input
          placeholder="Enter nostr npub"
          value={newNpub}
          onChange={(e) => setNewNpub(e.target.value)}
          className="npub-input"
        />
        {newNpub && !isValidNpub(newNpub) && (
          <div>
            <Typography.Text className="error-npub">this is not a valid npub</Typography.Text>
          </div>
        )}
        <Button
          type="primary"
          className="add-button"
          disabled={!isValidNpub(newNpub || '')}
          onClick={() => {
            setNpubList(new Set(NpubList).add(nip19.decode(newNpub!).data as string));
            setNewNpub('');
          }}
        >
          {' '}
          Add{' '}
        </Button>
      </AddNpubStyle>
    </div>
  );
};
