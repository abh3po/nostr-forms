import { Modal, Tooltip, Typography } from "antd";
import { isMobile } from "../../../../utils/utility";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { NpubList } from "./Sharing/NpubList";

const { Text } = Typography;
export const Notifications = () => {
  const { updateFormSetting, formSettings } = useFormBuilderContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSetNpubs = (npubs: Set<string>) => {
    updateFormSetting({
      notifyNpubs: Array.from(npubs),
    });
  };

  const hasNpubs = (formSettings.notifyNpubs || []).length > 0;

  return (
    <>
      <Tooltip
        title="Configure who will be notified when a response is submitted"
        trigger={isMobile() ? "click" : "hover"}
      >
        <div className="property-setting">
          <Text>Configure Notifications</Text>
          <EditOutlined onClick={() => setIsModalOpen(true)} />
        </div>
      </Tooltip>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <NpubList
          NpubList={new Set(formSettings.notifyNpubs || [])}
          setNpubList={handleSetNpubs}
          ListHeader={"Notification Recipients"}
        />
        {hasNpubs && (
          <Text className="warning-text">
            *These npubs will receive
            <a
              href="https://github.com/nostr-protocol/nips/blob/master/04.md"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              nip-04{" "}
            </a>
            encrypted notifications.
          </Text>
        )}
      </Modal>
    </>
  );
};
