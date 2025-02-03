import { Tooltip, Typography } from "antd";
import { isMobile } from "../../../../../utils/utility";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import AddNpubStyle from "../addNpub.style";
import { Editors } from "./Editors";
import { Participants } from "./Participants";
import { useProfileContext } from "../../../../../hooks/useProfileContext";

enum ROLE {
  VIEW,
  EDIT,
}

const { Text } = Typography;
export const Sharing = () => {
  const { pubkey: userPubkey, requestPubkey } = useProfileContext();
  const [isEditListOpen, setIsEditListOpen] = useState<boolean>(false);
  const [isViewListOpen, setIsViewListOpen] = useState<boolean>(false);
  return (
    <>
      <Tooltip
        title="Configure who can access this form and how?"
        trigger={isMobile() ? "click" : "hover"}
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
          <Editors
            open={isEditListOpen}
            onCancel={() => setIsEditListOpen(false)}
          />
          <Participants
            open={isViewListOpen}
            onCancel={() => setIsViewListOpen(false)}
          />
        </div>
      </Tooltip>
    </>
  );
};
