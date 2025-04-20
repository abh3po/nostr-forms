import React, { createContext, FC, ReactNode, useRef, useState } from "react";
import { SimplePool } from "nostr-tools";

interface ApplicationProviderProps {
  children?: ReactNode;
}

export interface ApplicationContextType {
  poolRef: React.MutableRefObject<SimplePool>;
}

export const ApplicationContext = createContext<
  ApplicationContextType | undefined
>(undefined);

export const ApplicationProvider: FC<ApplicationProviderProps> = ({
  children,
}) => {
  const poolRef = useRef(new SimplePool());
  const contextValue: ApplicationContextType = {
    poolRef,
  };

  return (
    <ApplicationContext.Provider value={ contextValue }>
      {children}
    </ApplicationContext.Provider>
  );
};
