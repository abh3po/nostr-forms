import { Field, Option } from "@formstr/sdk/dist/formstr/nip101";
import { getValidationRules } from "../validations";
import { Form } from "antd";
import { QuestionNode } from "../QuestionNode/QuestionNode";

interface FormFieldsProps {
  fields: Array<Field>;
  handleInput: (questionId: string, answer: string, message?: string) => void;
  testId? : string;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  fields,
  handleInput,
  testId = "form-fields",
}) => {
  return fields.map((field) => {
    let [_, fieldId, type, label, optionsString, config] = field;
    let fieldConfig = JSON.parse(config);
    let options = JSON.parse(optionsString || "[]") as Option[];
    let rules = [
      {
        required: fieldConfig.required,
        message: "This is a required question",
      },
      ...getValidationRules(fieldConfig.renderElement, fieldConfig),
    ];
    return (
      <Form.Item key={fieldId} rules={rules} name={fieldId} data-testid={`${testId}:form-item-${fieldId}`}>
        <QuestionNode
          required={fieldConfig.required || false}
          label={label}
          fieldConfig={fieldConfig}
          fieldId={fieldId}
          options={options}
          inputHandler={handleInput}
          testId={`${testId}:question-${fieldId}`}
        />
      </Form.Item>
    );
  });
};
