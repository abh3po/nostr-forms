import { FormSpec, V1FormSpec } from "@formstr/sdk/dist/interfaces";
import FillerStyle from "./formFiller.style";
import FormTitle from "../../../containers/CreateFormNew/components/FormTitle";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { getFormTemplate, sendResponses, sendNotification } from "@formstr/sdk";
import { Form, Typography } from "antd";
import { QuestionNode } from "./QuestionNode/QuestionNode";
import { ThankYouScreen } from "./ThankYouScreen";
import { getValidationRules } from "./validations";
import { SubmitButton } from "./SubmitButton/submit";
import { isMobile, makeTag } from "../../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../../Images/created-using-formstr.svg";
import {
  LOCAL_STORAGE_KEYS,
  getItem,
  setItem,
} from "../../../utils/localStorage";
import { ROUTES as GLOBAL_ROUTES } from "../../../constants/routes";
import Markdown from "react-markdown";

const { Text } = Typography;

interface FormFillerProps {
  formSpec?: FormSpec;
  embedded?: boolean;
}

export const FormFillerOld: React.FC<FormFillerProps> = ({
  formSpec,
  embedded,
}) => {
  const { formId } = useParams();
  const [formTemplate, setFormTemplate] = useState<V1FormSpec | null>(null);
  const [form] = Form.useForm();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [thankYouScreen, setThankYouScreen] = useState(false);
  const [searchParams] = useSearchParams();
  const hideTitleImage = searchParams.get("hideTitleImage") === "true";
  const hideDescription = searchParams.get("hideDescription") === "true";
  const navigate = useNavigate();

  const isPreview = !!formSpec;

  const convertFromSpecToTemplate = (formSpec: FormSpec): V1FormSpec => {
    let fields = formSpec.fields?.map((field) => {
      return {
        ...field,
        questionId: makeTag(6),
      };
    });
    return {
      schemaVersion: "v1",
      name: formSpec.name,
      settings: formSpec.settings,
      fields,
    };
  };

  useEffect(() => {
    async function getForm() {
      if (!formTemplate) {
        if (!formId && !formSpec) {
          throw Error("Form Id not provided");
        }
        let form = null;
        if (formId) form = await getFormTemplate(formId);
        if (formSpec) form = convertFromSpecToTemplate(formSpec);

        if (!form) return;
        setFormTemplate(form);
      }
    }
    getForm();
  }, [formTemplate, formId, formSpec]);

  if (!formId && !formSpec) {
    return null;
  }

  const handleInput = (
    questionId: string,
    answer: string,
    message?: string
  ) => {
    if (!answer || answer === "") {
      form.setFieldValue(questionId, null);
      return;
    }
    form.setFieldValue(questionId, [answer, message]);
  };

  const saveResponse = async (anonymous: boolean = true) => {
    let formResponses = form.getFieldsValue(true);
    const response = Object.keys(formResponses).map((key: string) => {
      let answer = null;
      let message = null;
      if (formResponses[key]) [answer, message] = formResponses[key];
      return {
        questionId: key,
        answer,
        message,
      };
    });
    let userId = null;
    if (formId) {
      userId = await sendResponses(formId, response, anonymous);
    }
    if (formTemplate && !isPreview) sendNotification(formTemplate, response);
    setFormSubmitted(true);
    setThankYouScreen(true);
  };

  let name, settings, fields;
  if (formTemplate) {
    name = formTemplate.name;
    settings = formTemplate.settings;
    fields = formTemplate.fields;
  }
  return (
    <FillerStyle $isPreview={isPreview}>
      {!formSubmitted && (
        <div className="filler-container">
          <div className="form-filler">
            {!hideTitleImage && (
              <FormTitle
                className="form-title"
                edit={false}
                imageUrl={settings?.titleImageUrl}
                formTitle={name}
              />
            )}
            {!hideDescription && (
              <div className="form-description">
                <Text>
                  <Markdown>{settings?.description}</Markdown>
                </Text>
              </div>
            )}

            <Form
              form={form}
              onFinish={() => {}}
              className={
                hideDescription ? "hidden-description" : "with-description"
              }
            >
              <div>
                {fields?.map((field) => {
                  let rules = [
                    {
                      required: field.answerSettings.required,
                      message: "This is a required question",
                    },
                    ...getValidationRules(
                      field.answerType,
                      field.answerSettings
                    ),
                  ];
                  return (
                    <Form.Item
                      key={field.questionId}
                      rules={rules}
                      name={field.questionId}
                    >
                      <QuestionNode
                        required={field.answerSettings.required || false}
                        field={field}
                        inputHandler={handleInput}
                      />
                    </Form.Item>
                  );
                })}
                <SubmitButton
                  selfSign={formTemplate?.settings?.disallowAnonymous}
                  edit={false}
                  onSubmit={saveResponse}
                  form={form}
                  disabled={isPreview}
                />
              </div>
            </Form>
          </div>
          <div className="branding-container">
            <Link to="/">
              <CreatedUsingFormstr />
            </Link>
            {!isMobile() && (
              <a
                href="https://github.com/abhay-raizada/nostr-forms"
                className="foss-link"
              >
                <Text className="text-style">
                  Formstr is free and Open Source
                </Text>
              </a>
            )}
          </div>
        </div>
      )}
      {embedded ? (
        formSubmitted && (
          <div className="embed-submitted">
            {" "}
            <Text>Response Submitted</Text>{" "}
          </div>
        )
      ) : (
        <ThankYouScreen
          isOpen={thankYouScreen}
          onClose={() => {
            if (!embedded) {
              navigate(`${GLOBAL_ROUTES.DASHBOARD}`);
            } else {
              setThankYouScreen(false);
            }
          }}
        />
      )}
    </FillerStyle>
  );
};
