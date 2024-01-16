import { useLocation } from "react-router-dom";
import FormBuilder from "./FormBuilder";
import useFormBuilderContext from "./hooks/useFormBuilderContext";
import { useEffect, useState } from "react";
import { HEADER_MENU_KEYS } from "./components/Header/config";
import { FormFiller } from "../FormFiller";

function CreateForm() {
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
    console.log("form spec is in filler", getFormSpec());
    return <FormFiller formSpec={getFormSpec()} />;
  }
}

export default CreateForm;
