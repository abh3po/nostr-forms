import { Typography } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { ChangeEvent, useState } from "react";

const { Text } = Typography;

function FormIdentifier() {
  const { updateFormSetting, formSettings } = useFormBuilderContext();
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
