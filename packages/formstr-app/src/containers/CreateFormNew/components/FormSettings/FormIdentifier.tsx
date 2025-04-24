import { ChangeEvent } from 'react';

import useFormBuilderContext from '../../hooks/useFormBuilderContext';

function FormIdentifier() {
  const { updateFormSetting, formSettings } = useFormBuilderContext();
  // console.log("Form id is", formSettings.formId);
  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormSetting({ ...formSettings, formId: e.target.value });
  };
  return (
    <>
      <input
        className="file-input"
        type="text"
        placeholder="Form Identifier"
        value={formSettings.formId}
        onChange={handleIdentifierChange}
      />
    </>
  );
}

export default FormIdentifier;
