import { useContext } from 'react';

import { ApplicationContext, ApplicationContextType } from '../../provider/ApplicationProvider';

export const useApplicationContext = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

export default ApplicationContext;
