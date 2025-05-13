import { Collapse, Typography, Button, Tooltip } from "antd";
import { ReloadOutlined } from '@ant-design/icons';
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import RelayStatusIndicator from "../../../../components/RelayStatusIndicator";
import { RelayItem, RelayStatus } from "../../providers/FormBuilder/typeDefs";
import React from "react";

const { Text } = Typography;
const ReadOnlyRelayListItem = ({
  relay,
  status,
}: {
  relay: RelayItem;
  status: RelayStatus;
}) => {
  return (
    <div className="relay-item read-only" style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
      <RelayStatusIndicator status={status} />
      <Typography.Text ellipsis={true} style={{ flexGrow: 1, marginRight: '8px' }}>
        {relay.url}
      </Typography.Text>
    </div>
  );
};

const ReadOnlyRelayListItems = () => {
  const { relayList, relayConnectionStatuses } = useFormBuilderContext();
  if (!relayList || relayList.length === 0) {
    return <Text type="secondary" style={{ padding: '8px 0' }}>No relays configured.</Text>;
  }

  return (
    <React.Fragment> {}
      {relayList.map((relay) => (
        <ReadOnlyRelayListItem
          key={relay.tempId}
          relay={relay}
          status={relayConnectionStatuses.get(relay.tempId) || 'unknown'}
        />
      ))}
    </React.Fragment>
  );
};

export const RelayList = () => {
  const { testAllRelayConnections } = useFormBuilderContext();
  const handlePanelChange = (key: string | string[]) => {
    const isOpen = Array.isArray(key) ? key.includes("Relays") : key === "Relays";
    if (isOpen) {
      testAllRelayConnections();
    }
  };

  const items = [
    {
      key: "Relays",
      label: "Configured Relays",
      children: <ReadOnlyRelayListItems />,
      extra: (
        <Tooltip title="Refresh Relay Statuses">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              testAllRelayConnections();
            }}
          />
        </Tooltip>
      )
    },
  ];

  return (
    <Collapse
      items={items}
      expandIconPosition="end"
      ghost
      onChange={handlePanelChange}
    />
  );
};