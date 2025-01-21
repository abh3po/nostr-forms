import { useLocation } from "react-router-dom";
import FormBuilder from "../CreateFormNew/FormBuilder";
import useFormBuilderContext from "../CreateFormNew/hooks/useFormBuilderContext";
import { useEffect, useState } from "react";
import { HEADER_MENU_KEYS } from "../CreateFormNew/components/Header/config";
import { FormFiller } from "../FormFillerNew";

function EditForm() {
  const { state } = useLocation();
  const { initializeForm, saveDraft, selectedTab, getFormSpec } =
    useFormBuilderContext();
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

export default EditForm;
