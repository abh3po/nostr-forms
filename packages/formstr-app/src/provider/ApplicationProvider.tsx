import { SimplePool } from 'nostr-tools';
import React, { createContext, FC, ReactNode, useRef, useState } from 'react';

interface ApplicationProviderProps {
  children?: ReactNode;
}

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<SimplePool>;
  isTemplateModalOpen: boolean;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
}

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({ children }) => {
  const poolRef = useRef(new SimplePool());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const openTemplateModal = () => setIsTemplateModalOpen(true);
  const closeTemplateModal = () => setIsTemplateModalOpen(false);
  const contextValue: ApplicationContextType = {
    poolRef,
    isTemplateModalOpen,
    openTemplateModal,
    closeTemplateModal,
  };

  return <ApplicationContext.Provider value={contextValue}>{children}</ApplicationContext.Provider>;
};
