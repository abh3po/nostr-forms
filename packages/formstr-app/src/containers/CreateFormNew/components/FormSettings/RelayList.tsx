import { CloseOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getDefaultRelays } from '@formstr/sdk';
import { makeTag } from '@formstr/sdk/dist/utils/utils';
import { Button, Collapse, Input, Typography } from 'antd';
import { useState } from 'react';

import useFormBuilderContext from '../../hooks/useFormBuilderContext';
import { isValidWebSocketUrl } from '../../utils';

const { Text } = Typography;

const RelayEdit = ({
  onSave,
  onClose,
  defaultRelay,
}: {
  onSave: (relay: string) => void;
  onClose: () => void;
  defaultRelay?: string;
}) => {
  const [newRelay, setNewRelay] = useState(defaultRelay || '');
  const [isError, setIsError] = useState(false);

  const handleSave = () => {
    if (!isValidWebSocketUrl(newRelay)) {
      setIsError(true);
      return;
    }
    setIsError(false);
    onSave(newRelay);
  };

  const handleClose = () => {
    setIsError(false);
    onClose();
  };

  return (
    <>
      <div className="relay-item">
        <CloseOutlined onClick={handleClose} className="relay-edit-item" />
        <Input
          defaultValue={defaultRelay}
          onChange={(e) => setNewRelay(e.target.value)}
          className="relay-edit-item"
        />
        <Button
          size="middle"
          icon={<SaveOutlined className="relay-icon" />}
          type="dashed"
          onClick={handleSave}
        />
      </div>
      <div>{isError && <Text type="danger"> Not a valid websocket url</Text>}</div>
    </>
  );
};

const RelayListItem = ({
  relay,
  onEdit,
  onDelete,
}: {
  relay: { url: string; tempId: string };
  onEdit: (newRelayUrl: string, tempId: string) => void;
  onDelete: (tempId: string) => void;
}) => {
  const [edit, setEdit] = useState(false);

  const onEditRelay = (editInput: string) => {
    setEdit(false);
    onEdit(editInput, relay.tempId);
  };

  const handleDelete = (e: any) => {
    onDelete(relay.tempId);
  };
  return (
    <>
      <div className="relay-item">
        {!edit && (
          <>
            <div className="relay-text-container">
              <label> {relay.url} </label>
            </div>
            <div>
              <EditOutlined
                onClick={() => {
                  setEdit(true);
                }}
                className="relay-icons"
              />
              <DeleteOutlined className="relay-icons" onClick={handleDelete} />
            </div>
          </>
        )}
      </div>
      {edit && (
        <RelayEdit onSave={onEditRelay} onClose={() => setEdit(false)} defaultRelay={relay.url} />
      )}
    </>
  );
};

const RelayListItems = () => {
  let relays = getDefaultRelays().map((relay) => {
    return { url: relay, tempId: makeTag(6) };
  });
  const { relayList, setRelayList } = useFormBuilderContext();
  const [newRelay, setNewRelay] = useState(false);

  const onAdd = (newRelayUrl: string) => {
    setRelayList([...relayList, { url: newRelayUrl, tempId: makeTag(6) }]);
    setNewRelay(false);
  };
  const onEdit = (newRelay: string, tempId: string) => {
    relays = relayList.map((relay) => {
      if (relay.tempId === tempId) {
        return { url: newRelay, tempId: tempId };
      }
      return relay;
    });
    setRelayList(relays);
  };

  const onDelete = (tempId: string) => {
    relays = relayList.filter((relay) => relay.tempId !== tempId);
    setRelayList(relays);
  };

  return (
    <>
      {newRelay && (
        <RelayEdit
          onSave={onAdd}
          onClose={() => {
            setNewRelay(false);
          }}
        />
      )}

      <div className="add-relay-container">
        {!newRelay && (
          <Button
            type="link"
            onClick={() => {
              setNewRelay(true);
            }}
          >
            + Add Relay
          </Button>
        )}
      </div>
      {relayList.map((relay) => (
        <RelayListItem relay={relay} onEdit={onEdit} onDelete={onDelete} key={relay.tempId} />
      ))}
    </>
  );
};

export const RelayList = () => {
  return (
    <Collapse
      items={[
        {
          key: 'Relays',
          label: 'Relays',
          children: RelayListItems(),
        },
      ]}
      expandIconPosition="end"
      ghost
    />
  );
};
