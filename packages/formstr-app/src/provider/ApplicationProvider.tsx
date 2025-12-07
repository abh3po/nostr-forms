import React, { createContext, FC, ReactNode, useRef, useState } from "react";
import { SimplePool } from "nostr-tools";
import { pool } from "../pool";
import { AuthPool } from "../pool/AuthPool";

interface ApplicationProviderProps {
  children?: ReactNode;
}

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<AuthPool>;
}

export const ApplicationContext = createContext<
  ApplicationContextType | undefined
>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({
  children,
}) => {
  const poolRef = useRef(pool);
  const contextValue: ApplicationContextType = {
    poolRef,
  };

  return (
    <ApplicationContext.Provider value={contextValue}>
      {children}
    </ApplicationContext.Provider>
  );
};
