import React, { createContext, FC, ReactNode, useRef, useState } from "react";
import { SimplePool } from "nostr-tools";

interface ApplicationProviderProps {
  children?: ReactNode;
}

import { ProfileInfo } from "../utils/profileUtils";

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<SimplePool>;
  isTemplateModalOpen: boolean;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  profiles: Map<string, ProfileInfo>;
  setProfiles: React.Dispatch<React.SetStateAction<Map<string, ProfileInfo>>>;
}

export const ApplicationContext = createContext<
  ApplicationContextType | undefined
>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({
  children,
}) => {
  const poolRef = useRef(new SimplePool());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Map<string, ProfileInfo>>(new Map());
  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => setIsTemplateModalOpen(false);
  const contextValue: ApplicationContextType = {
    poolRef,
    isTemplateModalOpen,
    openTemplateModal,
    closeTemplateModal,
    profiles,
    setProfiles,
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};