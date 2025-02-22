import { Field, Tag, Option, Response } from "@formstr/sdk/dist/formstr/nip101";
import FillerStyle from "./formFiller.style";
import FormTitle from "../CreateFormNew/components/FormTitle";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Form, Spin, Typography, Steps, Card, Divider, Space } from "antd";
import { ThankYouScreen } from "./ThankYouScreen";
import { SubmitButton } from "./SubmitButton/submit";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";
import Markdown from "react-markdown";
import { Event, generateSecretKey, nip19 } from "nostr-tools";
import { FormFields } from "./FormFields";
import { RequestAccess } from "./RequestAccess";
import { CheckRequests } from "./CheckRequests";
import { fetchFormTemplate } from "@formstr/sdk/dist/formstr/nip101/fetchFormTemplate";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { AddressPointer } from "nostr-tools/nip19";
import { LoadingOutlined } from "@ant-design/icons";
import { sendNotification } from "../../nostr/common";
import { sendResponses } from "../../nostr/common";
import { SectionData } from "../CreateFormNew/providers/FormBuilder/typeDefs";

const { Text } = Typography;
const { Step } = Steps;

interface FormFillerProps {
  formSpec?: Tag[];
  embedded?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({
  formSpec,
  embedded,
}) => {
  const { naddr } = useParams();
  let isPreview: boolean = false;
  if (!naddr) isPreview = true;
  let decodedData;
  if (!isPreview) decodedData = nip19.decode(naddr!).data as AddressPointer;
  let pubKey = decodedData?.pubkey;
  let formId = decodedData?.identifier;
  let relays = decodedData?.relays;
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  const [formTemplate, setFormTemplate] = useState<Tag[] | null>(
    formSpec || null
  );
  const [form] = Form.useForm();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [noAccess, setNoAccess] = useState<boolean>(false);
  const [editKey, setEditKey] = useState<string | undefined | null>();
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
  const [thankYouScreen, setThankYouScreen] = useState(false);
  const [formEvent, setFormEvent] = useState<Event | undefined>();
  const [searchParams] = useSearchParams();
  const hideTitleImage = searchParams.get("hideTitleImage") === "true";
  const viewKeyParams = searchParams.get("viewKey");
  const hideDescription = searchParams.get("hideDescription") === "true";
  const navigate = useNavigate();
  const [formAnswers, setFormAnswers] = useState<Record<string, string>>({});
  
  // Section state
  const [sections, setSections] = useState<SectionData[]>([]);
  const [sectionedFields, setSectionedFields] = useState<Field[][]>([]);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  isPreview = !!formSpec;

  if (!formId && !formSpec) {
    return null;
  }

  const onKeysFetched = (keys: Tag[] | null) => {
    let editKey = keys?.find((k) => k[0] === "EditAccess")?.[1] || null;
    setEditKey(editKey);
  };

  const initialize = async (
    formAuthor: string,
    formId: string,
    relays?: string[]
  ) => {
    if (!formEvent) {
      const form = await fetchFormTemplate(formAuthor, formId, relays);
      if (!form) return;
      setFormEvent(form);
      setAllowedUsers(getAllowedUsers(form));
      const formSpec = await getFormSpec(
        form,
        userPubKey,
        onKeysFetched,
        viewKeyParams
      );
      if (!formSpec) setNoAccess(true);
      setFormTemplate(formSpec);
      
      // Process sections if they exist
      if (formSpec) {
        const settingsJson = formSpec.find(tag => tag[0] === "settings")?.[1] || "{}";
        try {
          const settings = JSON.parse(settingsJson);
          console.log("Form settings:", settings); // Check if sections exist here
          if (settings.sections && Array.isArray(settings.sections)) {
            setSections(settings.sections);
            
            // Organize fields by section
            const allFields = formSpec.filter(tag => tag[0] === "field") as Field[];
            if (settings.sections.length === 0) {
              setSectionedFields([allFields]);
            } else {
              const organizedFields = settings.sections.map((section: SectionData) => 
                allFields.filter(field => section.questionIds.includes(field[1]))
              );
              setSectionedFields(organizedFields);
            }
          }
        } catch (error) {
          console.error("Error processing sections:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (!(pubKey && formId)) {
      return;
    }
    initialize(pubKey, formId, relays);
  }, [formEvent, formTemplate, userPubKey]);

  // Process sections when formTemplate changes
  useEffect(() => {
    if (!formTemplate) return;
    
    
    const settingsJson = formTemplate.find(tag => tag[0] === "settings")?.[1] || "{}";
    try {
      const settings = JSON.parse(settingsJson);
      if (settings.sections && Array.isArray(settings.sections)) {
        setSections(settings.sections);

        console.log("Loaded settings:", settings);
        console.log("Sections:", settings.sections);
        
        // Organize fields by section
        const allFields = formTemplate.filter(tag => tag[0] === "field") as Field[];
        if (settings.sections.length === 0) {
          setSectionedFields([allFields]);
        } else {
          const organizedFields = settings.sections.map((section: SectionData) => 
            allFields.filter(field => section.questionIds.includes(field[1]))
          );
          setSectionedFields(organizedFields);
        }
      } else {
        // No sections, put all fields in one group
        const allFields = formTemplate.filter(tag => tag[0] === "field") as Field[];
        setSectionedFields([allFields]);
      }
      console.log("Loaded settings:", settings);
        console.log("Sections:", settings.sections);
    } catch (error) {
      console.error("Error processing sections:", error);
      // Fallback: put all fields in one section
      const allFields = formTemplate.filter(tag => tag[0] === "field") as Field[];
      setSectionedFields([allFields]);
    }
  }, [formTemplate]);

  const handleInput = (
    questionId: string,
    answer: string,
    message?: string
  ) => {
    if (!answer || answer === "") {
      form.setFieldValue(questionId, null);
      setFormAnswers(prev => ({...prev, [questionId]: ""}));
      return;
    }
    form.setFieldValue(questionId, [answer, message]);
    setFormAnswers(prev => ({...prev, [questionId]: answer}));
  };

  const shouldShowQuestion = (question: Field): boolean => {
    try {
      const answerSettings = JSON.parse(question[5] || '{}');
      const conditions = answerSettings.conditions;
      if (!conditions?.rules?.length) return true;
      return conditions.rules.every((rule: { questionId: string | number; value: string; }) => formAnswers[rule.questionId] === rule.value);
    } catch {
      return true;
    }
  };

  const saveResponse = async (anonymous: boolean = true) => {
    if (!formId || !pubKey) {
      throw "Cant submit to a form that has not been published";
    }
    
    setIsSubmitting(true);
    let formResponses = form.getFieldsValue(true);
    let formRelays = formEvent?.tags
      .filter((r) => r[0] === "relay")
      ?.map((r) => r[1]);
    let responseRelays = Array.from(
      new Set([...(relays || []), ...(formRelays || [])])
    );
    const responses: Response[] = Object.keys(formResponses).map(
      (fieldId: string) => {
        let answer = null;
        let message = null;
        if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
        return ["response", fieldId, answer, JSON.stringify({ message })];
      }
    );
    let anonUser = null;
    if (anonymous) {
      anonUser = generateSecretKey();
    }
    
    try {
      await sendResponses(
        pubKey,
        formId,
        responses,
        anonUser,
        true,
        responseRelays
      );
      console.log("Submitted!");
      sendNotification(formTemplate!, responses);
      setFormSubmitted(true);
      setThankYouScreen(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    try {
      // Get visible fields in current section
      const visibleFields = sectionedFields[currentSection]?.filter(shouldShowQuestion) || [];
      
      // Validate current section fields
      await form.validateFields(visibleFields.map(field => field[1]));
      
      // If this is the last section, submit
      if (currentSection === sections.length - 1 || sections.length === 0) {
        const settings = formTemplate ? JSON.parse(
          formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}"
        ) as IFormSettings : {};
        
        if (allowedUsers.length === 0) {
          saveResponse(!settings.disallowAnonymous);
        } else {
          saveResponse(false); // Always self-sign if form has allowedUsers
        }
        return;
      }
      
      // Otherwise, go to next section
      setCurrentSection(prev => prev + 1);
      form.setFields(
        (sectionedFields[currentSection + 1] || []).map(field => ({
          name: field[1],
          errors: []
        }))
      );
      
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const renderSubmitButton = (settings: IFormSettings) => {
    // For multi-section forms, use the built-in Continue/Submit buttons
    if (sections.length > 1) {
      return null;
    }
    
    if (isPreview) return null;
    if (allowedUsers.length === 0) {
      return (
        <SubmitButton
          selfSign={settings.disallowAnonymous}
          edit={false}
          onSubmit={saveResponse}
          form={form}
        />
      );
    } else if (!userPubKey) {
      return <Button onClick={requestPubkey}>Login to fill this form</Button>;
    } else if (userPubKey && !allowedUsers.includes(userPubKey)) {
      return <RequestAccess pubkey={pubKey!} formId={formId!} />;
    } else {
      return (
        <SubmitButton
          selfSign={true}
          edit={false}
          onSubmit={saveResponse}
          form={form}
        />
      );
    }
  };

  if ((!pubKey || !formId) && !isPreview) {
    return <Text>INVALID FORM URL</Text>;
  }
  if (!formEvent && !isPreview) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            display: "block",
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#F7931A" }}
                spin
              />
            }
          />
        </Text>
      </div>
    );
  } else if (
    !isPreview &&
    formEvent?.content !== "" &&
    !userPubKey &&
    !viewKeyParams
  ) {
    return (
      <>
        <Text>
          This form is access controlled and requires login to continue
        </Text>
        <Button
          onClick={() => {
            requestPubkey();
          }}
        >
          Login
        </Button>
      </>
    );
  }
  if (noAccess) {
    return (
      <>
        <Text>Your profile does not have access to view this form</Text>
        <RequestAccess pubkey={pubKey!} formId={formId!} />
      </>
    );
  }
  
  let name: string, settings: IFormSettings, fields: Field[];
  if (formTemplate) {
    name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
    settings = JSON.parse(
      formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}"
    ) as IFormSettings;
    fields = formTemplate.filter((tag) => tag[0] === "field") as Field[];

    // For multi-section forms with steps UI
    if (sections.length > 1 && !formSubmitted) {
      return (
        <FillerStyle $isPreview={isPreview}>
          {editKey && !isPreview ? (
            <CheckRequests
              pubkey={pubKey!}
              formId={formId!}
              secretKey={editKey}
              formEvent={formEvent!}
            />
          ) : null}
          
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

              <Steps current={currentSection} style={{ marginBottom: 24 }}>
                {sections.map((section, index) => (
                  <Step key={section.id} title={section.title || `Section ${index + 1}`} />
                ))}
              </Steps>

              <Form
                form={form}
                className={
                  hideDescription ? "hidden-description" : "with-description"
                }
              >
                <Card>
                  <div className="section-header">
                    <Text strong style={{ fontSize: 18 }}>
                      {sections[currentSection]?.title || `Section ${currentSection + 1}`}
                    </Text>
                    {sections[currentSection]?.description && (
                      <Text style={{ marginTop: 8, display: 'block' }}>
                        <Markdown>{sections[currentSection].description}</Markdown>
                      </Text>
                    )}
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <FormFields 
                      fields={sectionedFields[currentSection]?.filter(shouldShowQuestion) || []} 
                      handleInput={handleInput} 
                    />
                  </div>
                </Card>
                
                <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Button 
                    onClick={handleBack}
                    disabled={currentSection === 0}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="primary"
                    onClick={handleContinue}
                    loading={isSubmitting}
                  >
                    {currentSection === sections.length - 1 ? 'Submit' : 'Continue'}
                  </Button>
                </Space>
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
                  let navigationUrl = editKey ? `/r/${pubKey}/${formId}` : `/`;
                  navigate(navigationUrl);
                } else {
                  setThankYouScreen(false);
                }
              }}
            />
          )}
        </FillerStyle>
      );
    }

    // For single section or non-sectioned forms (original behavior)
    return (
      <FillerStyle $isPreview={isPreview}>
        {editKey && !isPreview ? (
          <CheckRequests
            pubkey={pubKey!}
            formId={formId!}
            secretKey={editKey}
            formEvent={formEvent!}
          />
        ) : null}
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
                  <FormFields 
                    fields={fields.filter(shouldShowQuestion)} 
                    handleInput={handleInput} 
                  />
                  <>{renderSubmitButton(settings)}</>
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
                let navigationUrl = editKey ? `/r/${pubKey}/${formId}` : `/`;
                navigate(navigationUrl);
              } else {
                setThankYouScreen(false);
              }
            }}
          />
        )}
      </FillerStyle>
    );
  }
};