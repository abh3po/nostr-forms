import { Typography } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { ChangeEvent, useState } from "react";

const { Text } = Typography;

function FormIdentifier() {
  const { updateFormSetting, formSettings } = useFormBuilderContext();
  return (
    <>
      <input
        className="file-input"
        type="text"
        placeholder="Form Identifier"
        value={formSettings.formId}
        disabled
      />
    </>
  );
}

export default FormIdentifier;
