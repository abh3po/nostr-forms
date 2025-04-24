import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { FormFiller } from '../FormFillerNew';

import FormBuilder from './FormBuilder';
import { HEADER_MENU_KEYS } from './components/Header/config';
import useFormBuilderContext from './hooks/useFormBuilderContext';

function CreateForm() {
  const { state } = useLocation();
  const { initializeForm, saveDraft, selectedTab, getFormSpec } = useFormBuilderContext();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (state && !initialized) {
      initializeForm(state);
    }
    setInitialized(true);
    return () => {
      if (initialized) {
        saveDraft();
      }
    };
  }, [state, initialized, initializeForm, saveDraft]);

  if (selectedTab === HEADER_MENU_KEYS.BUILDER) {
    return <FormBuilder />;
  }
  if (selectedTab === HEADER_MENU_KEYS.PREVIEW) {
    return <FormFiller formSpec={getFormSpec()} />;
  }

  return null;
}

export default CreateForm;
