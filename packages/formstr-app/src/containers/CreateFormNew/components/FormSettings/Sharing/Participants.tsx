import { Divider, Modal, Switch, Tooltip, Typography } from "antd";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { isMobile } from "../../../../../utils/utility";
import { NpubList } from "./NpubList";

interface ParticipantProps {
  open: boolean;
  onCancel: () => void;
}

export const Participants: React.FC<ParticipantProps> = ({
  open,
  onCancel,
}) => {
  const { viewList, setViewList, formSettings, updateFormSetting } =
    useFormBuilderContext();
  return (
    <Modal open={open} onCancel={onCancel} footer={null}>
      <Typography.Text style={{ fontSize: 18 }}>Visibility</Typography.Text>
      {/*  */}
      {formSettings.encryptForm && (
        <Tooltip
          title="This toggle will include the view key in the form URL meaning anyone with the url will be able to see it."
          trigger={isMobile() ? "click" : "hover"}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 10,
            }}
          >
            <Typography.Text>Anyone with URL can access?</Typography.Text>
            <Switch
              checked={formSettings.viewKeyInUrl}
              onChange={() =>
                updateFormSetting({
                  ...formSettings,
                  viewKeyInUrl: !formSettings.viewKeyInUrl,
                })
              }
            />
          </div>
        </Tooltip>
      )}
      <Divider />
      {(viewList || {}).size === 0 && !formSettings.encryptForm ? (
        <>
          <Typography.Text>
            The form is currently public for everyone
          </Typography.Text>
          <Divider />
        </>
      ) : null}
      {(viewList || {}).size !== 0 && (
        <>
          <Typography.Text>
            Only the npubs below can fill the form
          </Typography.Text>
          <Divider />
        </>
      )}
      <NpubList
        NpubList={viewList}
        setNpubList={setViewList}
        ListHeader={"Participants"}
      />
      <Divider />
    </Modal>
  );
};
