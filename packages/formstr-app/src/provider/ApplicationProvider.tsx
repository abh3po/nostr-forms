import React, { createContext, FC, ReactNode, useRef,useState, useContext, } from "react";
import { SimplePool } from "nostr-tools";
import { Modal } from "antd";

interface ApplicationProviderProps {
  children?: ReactNode;
}

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<SimplePool>;
  requestLogin: () => void;
}

export const ApplicationContext = createContext<
  ApplicationContextType | undefined
>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({
  children,
}) => {
  const poolRef = useRef(new SimplePool());
  const requestLogin = async () => {
    if (!window.nostr) {
      Modal.warning({
        title: "Nostr Extension Not Found",
        content: "Please install a Nostr extension like Alby or Snort.",
      });
      return;
    }
  };
  const contextValue: ApplicationContextType = {
    poolRef,
    requestLogin,
  };

  return (
    <ApplicationContext.Provider value={ contextValue }>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplicationContext must be used within ApplicationProvider");
  }
  return context;
};