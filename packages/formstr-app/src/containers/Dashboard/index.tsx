import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FormDetails } from "../CreateFormNew/components/FormDetails";
import { Event, SubCloser } from "nostr-tools";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getDefaultRelays } from "@formstr/sdk";
import { FormEventCard } from "./FormCards/FormEventCard";
import DashboardStyleWrapper from "./index.style";
import EmptyScreen from "../../components/EmptyScreen";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { getItem, LOCAL_STORAGE_KEYS } from "../../utils/localStorage";
import { ILocalForm } from "../CreateFormNew/providers/FormBuilder/typeDefs";
import { LocalFormCard } from "./FormCards/LocalFormCard";
import { Dropdown, Menu, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { MyForms } from "./FormCards/MyForms";
import { Drafts } from "./FormCards/Drafts";
const MENU_OPTIONS = {
  local: "On this device",
  shared: "Shared with me",
  myForms: "My forms",
  drafts: "Drafts",
};

const defaultRelays = getDefaultRelays();

export const Dashboard = () => {
  const { state } = useLocation();
  const { pubkey } = useProfileContext();
  const [showFormDetails, setShowFormDetails] = useState<boolean>(!!state);
  const [localForms, setLocalForms] = useState<ILocalForm[]>(
    getItem(LOCAL_STORAGE_KEYS.LOCAL_FORMS) || []
  );
  const [nostrForms, setNostrForms] = useState<Map<string, Event>>(new Map());
  const [filter, setFilter] = useState<
    "local" | "shared" | "myForms" | "drafts"
  >("local");

  const { poolRef } = useApplicationContext();

  const subCloserRef = useRef<SubCloser | null>(null);

  const handleEvent = (event: Event) => {
    setNostrForms((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(event.id, event);
      return newMap;
    });
  };

  const fetchNostrForms = () => {
    const queryFilter = {
      kinds: [30168],
      "#p": [pubkey!],
    };

    subCloserRef.current = poolRef.current.subscribeMany(
      defaultRelays,
      [queryFilter],
      {
        onevent: handleEvent,
        onclose() {
          subCloserRef.current?.close();
        },
      }
    );
  };

  useEffect(() => {
    if (pubkey && nostrForms.size === 0) {
      fetchNostrForms();
    }
    return () => {
      if (subCloserRef.current) {
        subCloserRef.current.close();
      }
    };
  }, [pubkey]);

  const renderForms = () => {
    if (filter === "local") {
      if (localForms.length == 0) return <EmptyScreen />;
      return localForms.map((localForm: ILocalForm) => (
        <LocalFormCard
          key={localForm.key}
          form={localForm}
          onDeleted={() => {
            setLocalForms(localForms.filter((f) => f.key !== localForm.key));
          }}
        />
      ));
    } else if (filter === "shared") {
      if (nostrForms.size == 0) return <EmptyScreen />;
      return Array.from(nostrForms.values()).map((formEvent: Event) => {
        let d_tag = formEvent.tags.filter((t) => t[0] === "d")[0]?.[1];
        let key = `${formEvent.kind}:${formEvent.pubkey}:${
          d_tag ? d_tag : null
        }`;
        return <FormEventCard key={key} event={formEvent} />;
      });
    } else if (filter === "myForms") {
      return <MyForms />;
    } else if (filter === "drafts") {
      return <Drafts />;
    }
    return null;
  };

  const menu = (
    <Menu>
      <Menu.Item key="local" onClick={() => setFilter("local")}>
        {MENU_OPTIONS.local}
      </Menu.Item>
      <Menu.Item
        key="shared"
        onClick={() => setFilter("shared")}
        disabled={!pubkey}
      >
        {MENU_OPTIONS.shared}
      </Menu.Item>
      <Menu.Item
        key="myForms"
        onClick={() => setFilter("myForms")}
        disabled={!pubkey}
      >
        {MENU_OPTIONS.myForms}
      </Menu.Item>
      <Menu.Item key="drafts" onClick={() => setFilter("drafts")}>
        {MENU_OPTIONS.drafts}
      </Menu.Item>
    </Menu>
  );

  return (
    <DashboardStyleWrapper>
      <div className="dashboard-container">
        <div style={{ margin: 10 }}>
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
            <div
              style={{
                color: "grey",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography.Text>{MENU_OPTIONS[filter]} </Typography.Text>
              <DownOutlined
                style={{ marginLeft: "8px", fontSize: "12px", marginTop: -5 }}
              />
            </div>
          </Dropdown>
        </div>
        <div className="form-cards-container">{renderForms()}</div>
        <>
          {state && (
            <FormDetails
              isOpen={showFormDetails}
              {...state}
              onClose={() => {
                setShowFormDetails(false);
                setLocalForms(getItem(LOCAL_STORAGE_KEYS.LOCAL_FORMS) || []);
              }}
            />
          )}
        </>
      </div>
    </DashboardStyleWrapper>
  );
};
