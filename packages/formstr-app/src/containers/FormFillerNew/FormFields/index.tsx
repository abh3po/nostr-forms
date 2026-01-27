import { getValidationRules } from "../validations";
import { Form } from "antd";
import { QuestionNode } from "../QuestionNode/QuestionNode";
import { IFormSettings } from "../../CreateFormNew/components/FormSettings/types";
import { Field, GridOptions, Option } from "../../../nostr/types";

interface FormFieldsProps {
  fields: Array<Field>;
  handleInput: (questionId: string, answer: string, message?: string) => void;
  disabled?: boolean;
  values?: { [fieldId: string]: any };
  testId?: string;
  formSettings: IFormSettings;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  fields,
  handleInput,
  disabled = false,
  values = {},
  testId = "form-fields",
  formSettings,
}) => {
  return fields.map((field) => {
    let [_, fieldId, type, label, optionsString, config] = field;
    let fieldConfig = JSON.parse(config);
    let gridOptions: GridOptions | null;
    let options: Option[];
    if (type === "grid") {
      gridOptions = JSON.parse(optionsString || "{}");
      options = [];
    } else {
      options = JSON.parse(optionsString || "[]");
      gridOptions = null;
    }
    let rules = [
      {
        required: fieldConfig.required,
        message: "This is a required question",
      },
      ...getValidationRules(fieldConfig.renderElement, fieldConfig),
    ];
    return (
      <Form.Item
        key={fieldId}
        rules={rules}
        name={fieldId}
        data-testid={`${testId}:form-item-${fieldId}`}
      >
        <QuestionNode
          required={fieldConfig.required || false}
          label={label}
          fieldConfig={fieldConfig}
          fieldId={fieldId}
          options={options}
          inputHandler={handleInput}
          disabled={disabled}
          value={values[fieldId]}
          testId={`${testId}:question-${fieldId}`}
          formSettings={formSettings}
          gridOptions={gridOptions}
        />
      </Form.Item>
    );
  });
};
