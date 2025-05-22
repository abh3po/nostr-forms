import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Button, Input, List, Typography, Tooltip, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import useFormBuilderContext from '../../hooks/useFormBuilderContext';
import RelayStatusIndicator from '../../../../components/RelayStatusIndicator';
import { RelayItem, RelayStatus } from '../../providers/FormBuilder/typeDefs';
import { isValidWebSocketUrl } from '../../utils';
import { checkRelayConnection } from '../../../../utils/relayUtils';

const { Text } = Typography;

interface EditableRelayItemProps {
  relayItem: RelayItem;
  status: RelayStatus;
  onEdit: (tempId: string, newUrl: string) => void;
  onDelete: (tempId: string) => void;
  onTestConnection: (tempId: string, url: string) => void;
}

const EditableRelayListItem: React.FC<EditableRelayItemProps> = ({
  relayItem,
  status,
  onEdit,
  onDelete,
  onTestConnection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUrl, setEditedUrl] = useState(relayItem.url);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSave = () => {
    if (!isValidWebSocketUrl(editedUrl)) {
      setEditError('Invalid WebSocket URL');
      return;
    }
    setEditError(null);
    onEdit(relayItem.tempId, editedUrl);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedUrl(relayItem.url);
    setIsEditing(false);
    setEditError(null);
  };

  useEffect(() => {
    setEditedUrl(relayItem.url);
  }, [relayItem.url]);


  return (
    <List.Item
      actions={
        isEditing
          ? [
              <Tooltip title="Save" key="save">
                <Button icon={<SaveOutlined />} onClick={handleSave} type="text" />,
              </Tooltip>,
              <Tooltip title="Cancel" key="cancel">
                <Button icon={<CloseOutlined />} onClick={handleCancelEdit} type="text" danger />,
              </Tooltip>,
            ]
          : [
              <Tooltip title="Test Connection" key="test">
                <Button icon={<ReloadOutlined />} onClick={() => onTestConnection(relayItem.tempId, relayItem.url)} type="text" />,
              </Tooltip>,
              <Tooltip title="Edit Relay" key="edit">
                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)} type="text" />,
              </Tooltip>,
              <Tooltip title="Delete Relay" key="delete">
                <Button icon={<DeleteOutlined />} onClick={() => onDelete(relayItem.tempId)} type="text" danger />,
              </Tooltip>,
            ]
      }
      style={{ padding: '8px 0', alignItems: 'center' }}
    >
      <RelayStatusIndicator status={status} />
      {isEditing ? (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Input
            value={editedUrl}
            onChange={(e) => setEditedUrl(e.target.value)}
            onPressEnter={handleSave}
            style={{ marginRight: '8px' }}
          />
          {editError && <Text type="danger" style={{ fontSize: '12px', marginTop: '4px' }}>{editError}</Text>}
        </div>
      ) : (
        <Text ellipsis style={{ flexGrow: 1, marginRight: '8px' }}>
          {relayItem.url}
        </Text>
      )}
    </List.Item>
  );
};

interface RelayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelayManagerModal: React.FC<RelayManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    relayList,
    addRelayToList,
    editRelayInList,
    deleteRelayFromList,
  } = useFormBuilderContext();

  const [newRelayUrl, setNewRelayUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [localRelayStatuses, setLocalRelayStatuses] = useState<Map<string, RelayStatus>>(new Map());
  const prevRelayListRef = useRef<RelayItem[]>([]);


  const updateLocalRelayStatus = useCallback((relayId: string, status: RelayStatus) => {
    setLocalRelayStatuses(prevStatuses => new Map(prevStatuses).set(relayId, status));
  }, []);

  const testLocalRelayConnection = useCallback(async (relayId: string, url: string) => {
    updateLocalRelayStatus(relayId, 'pending');
    try {
      const status = await checkRelayConnection(url);
      updateLocalRelayStatus(relayId, status);
    } catch (error) {
      updateLocalRelayStatus(relayId, 'error');
    }
  }, [updateLocalRelayStatus]);

  const testAllLocalRelayConnections = useCallback(() => {
    relayList.forEach(relay => {
      testLocalRelayConnection(relay.tempId, relay.url);
    });
  }, [relayList, testLocalRelayConnection]);

  useEffect(() => {
    if (isOpen) {
      const initialStatuses = new Map<string, RelayStatus>();
      let hasNewRelays = false;
      const currentRelayIds = new Set(relayList.map(r => r.tempId));
      const prevRelayIds = new Set(prevRelayListRef.current.map(r => r.tempId));

      relayList.forEach(relay => {
        const existingStatus = localRelayStatuses.get(relay.tempId);
        initialStatuses.set(relay.tempId, existingStatus || 'unknown');
        if (!prevRelayIds.has(relay.tempId)) {
          hasNewRelays = true;
        }
      });
            localRelayStatuses.forEach((_status, tempId) => {
        if (!currentRelayIds.has(tempId)) {
          initialStatuses.delete(tempId);
        }
      });
      setLocalRelayStatuses(initialStatuses);
      if (relayList.length !== prevRelayListRef.current.length || hasNewRelays) {
         testAllLocalRelayConnections();
      }
    }
    prevRelayListRef.current = relayList;
  }, [isOpen, relayList, testAllLocalRelayConnections]);


  const handleAddNewRelay = () => {
    if (!isValidWebSocketUrl(newRelayUrl)) {
      setAddError('Invalid WebSocket URL');
      return;
    }
    setAddError(null);
    addRelayToList(newRelayUrl);
    setNewRelayUrl('');
    setIsAdding(false);
  };

  const handleEditRelay = (tempId: string, newUrl: string) => {
    editRelayInList(tempId, newUrl);
  };

  const handleDeleteRelay = (tempId: string) => {
    deleteRelayFromList(tempId);
  };

  return (
    <Modal
      title="Manage Relays"
      open={isOpen}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="testAll" onClick={testAllLocalRelayConnections} icon={<ReloadOutlined />}>
          Test All Connections
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      destroyOnClose
    >
      {isAdding ? (
        <Space.Compact style={{ width: '100%', marginBottom: '20px' }}>
           <Input
            placeholder="wss://your.relay.url"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            onPressEnter={handleAddNewRelay}
          />
          <Button type="primary" onClick={handleAddNewRelay} icon={<SaveOutlined />}>Add</Button>
          <Button onClick={() => {setIsAdding(false); setAddError(null); setNewRelayUrl('');}} icon={<CloseOutlined />}>Cancel</Button>
        </Space.Compact>
      ) : (
        <Button
            type="dashed"
            onClick={() => setIsAdding(true)}
            icon={<PlusOutlined />}
            style={{ width: '100%', marginBottom: '20px' }}
        >
            Add New Relay
        </Button>
      )}
      {addError && <Text type="danger" style={{ display: 'block', marginBottom: '10px', fontSize: '12px' }}>{addError}</Text>}

      <List
        itemLayout="horizontal"
        dataSource={relayList}
        renderItem={(item) => (
          <EditableRelayListItem
            relayItem={item}
            status={localRelayStatuses.get(item.tempId) || 'unknown'}
            onEdit={handleEditRelay}
            onDelete={handleDeleteRelay}
            onTestConnection={testLocalRelayConnection}
          />
        )}
        locale={{ emptyText: 'No relays configured. Add one to get started!' }}
        style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}
      />
    </Modal>
  );
};

export default RelayManagerModal;