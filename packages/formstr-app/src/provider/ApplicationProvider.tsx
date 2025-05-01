import React, { createContext, FC, ReactNode, useRef, useState } from "react";
import { SimplePool, Event } from "nostr-tools";
import { Profile } from "../nostr/types";

interface ApplicationProviderProps {
  children?: ReactNode;
}

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<SimplePool>;
  isTemplateModalOpen: boolean;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  profiles: Map<string, Profile>;
  addEventToProfiles: (event: Event) => void;
}

export const ApplicationContext = createContext<
  ApplicationContextType | undefined
>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({
  children,
}) => {
  const poolRef = useRef(new SimplePool());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const openTemplateModal = () => setIsTemplateModalOpen(true); 
  const closeTemplateModal = () => setIsTemplateModalOpen(false);

  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  const addEventToProfiles = (event: Event) => {
    if (profiles.has(event.pubkey)) return;
    try {
      let content = JSON.parse(event.content);
      const updatedProfiles = new Map(profiles);
      updatedProfiles.set(event.pubkey, { ...content, event: event });
      setProfiles(updatedProfiles);
    } catch (e) {
      console.error("Error parsing event", e);
    }
  };

  const addEventsToProfiles = (events: Event[]) => {
    const updatedProfiles = new Map(profiles);
    let hasUpdates = false;

    events.forEach((event: Event) => {
      if (!updatedProfiles.has(event.pubkey)) {
        try {
          let content = JSON.parse(event.content);
          updatedProfiles.set(event.pubkey, { ...content, event: event });
          hasUpdates = true;
        } catch (e) {
          console.error("Error parsing event", e);
        }
      }
    });

    if (hasUpdates) {
      setProfiles(updatedProfiles);
    }
  };

  const contextValue: ApplicationContextType = {
    poolRef,
    isTemplateModalOpen,
    openTemplateModal,
    closeTemplateModal,
    profiles,
    addEventToProfiles,
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};