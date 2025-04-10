import { useContext } from 'react';
import { AppContext } from '../../provider/AppProvider'

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within a AppContextProvider');
  }

  return context;
}