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
import { Dropdown, Menu, Typography, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { MyForms } from "./FormCards/MyForms";
import { Drafts } from "./FormCards/Drafts";
import { LocalForms } from "./FormCards/LocalForms";
import { useNavigate } from "react-router-dom"; 
import { availableTemplates, FormTemplate } from "../../templates";
import { ROUTES } from "../../constants/routes";
import { FormInitData } from "../CreateFormNew/providers/FormBuilder/typeDefs";
import TemplateSelectorModal from "../../components/TemplateSelectorModal";
import { createFormSpecFromTemplate } from "../../utils/formUtils";

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

  const { poolRef, isTemplateModalOpen, closeTemplateModal } = useApplicationContext();

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

  const navigate = useNavigate();

  const handleTemplateClick = (template: FormTemplate) => {
    const { spec, id } = createFormSpecFromTemplate(template);
    const navigationState: FormInitData = { spec, id };
    navigate(ROUTES.CREATE_FORMS_NEW, { state: navigationState });
  };

  const renderForms = () => {
    if (filter === "local") {
      if (localForms.length == 0){ 
        return (
          <EmptyScreen
            templates={availableTemplates}
            onTemplateClick={handleTemplateClick}
            message="No forms found on this device. Start by choosing a template:"
          />
        );
      }
      return (
        <LocalForms
          localForms={localForms}
          onDeleted={(localForm: ILocalForm) =>
            setLocalForms(localForms.filter((f) => f.key !== localForm.key))
          }
        />
      );
    } else if (filter === "shared") {
      if (nostrForms.size == 0){
        return <EmptyScreen message="No forms shared with you." />;
      }
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
    <Menu
    style={{ textAlign: "center"}}>
      <Menu.Item 
        key="local" 
        onClick={() => setFilter("local")}
      >
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
      <Menu.Item key="drafts" 
      onClick={() => setFilter("drafts")}
      >
        {MENU_OPTIONS.drafts}
      </Menu.Item>
    </Menu>
  );

  return (
    <DashboardStyleWrapper>
      <div className="dashboard-container">
      <div className="filter-dropdown-container">
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft" overlayClassName="dashboard-filter-menu"
>
            <Button>
              {MENU_OPTIONS[filter]}
              <DownOutlined
                style={{ marginLeft: "8px", fontSize: "12px" }}
              />
            </Button>
          </Dropdown>
        </div>
        <div className="form-cards-container">{renderForms()}</div>
        <TemplateSelectorModal
          visible={isTemplateModalOpen}
          onClose={closeTemplateModal}
          onTemplateSelect={handleTemplateClick}
        />
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