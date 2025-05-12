import { useLocation } from "react-router-dom";
import FormBuilder from "./FormBuilder";
import useFormBuilderContext from "./hooks/useFormBuilderContext";
import { useEffect, useState } from "react";
import { HEADER_MENU_KEYS } from "./components/Header/config";
import { FormFiller } from "../FormFillerNew";
import { FormRenderer } from "../FormFillerNew/FormRenderer";

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
    return (
      <FormRenderer
        formTemplate={getFormSpec()}
        form={null}
        footer={null}
        onInput={() => {}}
      />
    );
  }

  return null;
}

export default CreateForm;
