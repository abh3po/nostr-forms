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
import { Button, Form, Spin, Typography } from "antd";
import { ThankYouScreen } from "./ThankYouScreen";
import { SubmitButton } from "./SubmitButton/submit";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";
import Markdown from "react-markdown";
import { Event, generateSecretKey, nip19 } from "nostr-tools";
import { FormFields } from "./FormFields";
import { RequestAccess } from "./RequestAccess";
import { fetchFormTemplate } from "@formstr/sdk/dist/formstr/nip101/fetchFormTemplate";
import { useProfileContext } from "../../hooks/useProfileContext";
import { getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { AddressPointer } from "nostr-tools/nip19";
import { LoadingOutlined } from "@ant-design/icons";
import { sendNotification } from "../../nostr/common";
import { sendResponses } from "../../nostr/common";
import { AnswerTypes } from "@formstr/sdk/dist/interfaces";

// Define interfaces for condition rules and groups
interface ConditionRule {
  questionId: string;
  value: string | string[];
  operator?:
    | "equals"
    | "notEquals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "greaterThanEqual"
    | "lessThanEqual";
  nextLogic?: "AND" | "OR"; // How this rule combines with the next one
}

interface ConditionGroup {
  rules: (ConditionRule | ConditionGroup)[];
  nextLogic?: "AND" | "OR"; // How this group combines with the next element
}

interface AnswerSettings {
  conditions?: ConditionGroup;
  renderElement?: string;
}

const { Text } = Typography;

interface FormFillerProps {
  formSpec?: Tag[];
  embedded?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({
  formSpec,
  embedded,
}) => {
  const { naddr } = useParams();
  let isPreview = !!formSpec;
  if (!isPreview && !naddr)
    return <Text> Not enough data to render this url </Text>;
  
  let decodedData;
  if (!isPreview) decodedData = nip19.decode(naddr!).data as AddressPointer;
  
  const pubKey = decodedData?.pubkey;
  const formId = decodedData?.identifier;
  const relays = decodedData?.relays;
  
  const { pubkey: userPubKey, requestPubkey } = useProfileContext();
  
  const [formTemplate, setFormTemplate] = useState<Tag[] | null>(formSpec || null);
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
  const [formAnswers, setFormAnswers] = useState<Record<string, string | string[]>>({});
  const [fields, setFields] = useState<Field[]>([]);
  const [visibleFields, setVisibleFields] = useState<Field[]>([]);
  const [settings, setSettings] = useState<IFormSettings>({});
  const [formName, setFormName] = useState("");
  
  const navigate = useNavigate();

  if (!formId && !formSpec) {
    return null;
  }

  // Define functions
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
      
      if (!formSpec) {
        setNoAccess(true);
        return;
      }
      
      setFormTemplate(formSpec);
      
      const name = formSpec.find((tag) => tag[0] === "name")?.[1] || "";
      setFormName(name);
      
      const settingsData = JSON.parse(
        formSpec.find((tag) => tag[0] === "settings")?.[1] || "{}"
      ) as IFormSettings;
      setSettings(settingsData);
      
      const extractedFields = formSpec.filter((tag) => tag[0] === "field") as Field[];
      setFields(extractedFields);
    }
  };

  const handleInput = (
    questionId: string,
    answer: string | string[],
    message?: string
  ) => {
    if (
      !answer ||
      (typeof answer === "string" && answer === "") ||
      (Array.isArray(answer) && answer.length === 0)
    ) {
      form.setFieldValue(questionId, null);
      setFormAnswers((prev) => ({
        ...prev,
        [questionId]: Array.isArray(answer) ? [] : "",
      }));
      return;
    }
    
    form.setFieldValue(questionId, [answer, message]);
    setFormAnswers((prev) => ({ 
      ...prev, 
      [questionId]: answer 
    }));
    
    console.log("Updated form answers:", {
      ...formAnswers,
      [questionId]: answer
    });
  };

  const getResponseRelays = (formEvent: Event) => {
    let formRelays = formEvent.tags
      .filter((r) => r[0] === "relay")
      ?.map((r) => r[1]);
    return Array.from(new Set([...(relays || []), ...(formRelays || [])]));
  };

  // Determine if a condition is a rule or a group
  function isConditionRule(
    condition: ConditionRule | ConditionGroup
  ): condition is ConditionRule {
    return "questionId" in condition;
  }

  // Evaluate a single condition rule
  const evaluateRule = (
    rule: ConditionRule,
    answers: Record<string, string | string[]>,
    allFields: Field[]
  ): boolean => {
    console.log("Evaluating rule:", rule);
    console.log("With answers:", answers);
    
    // If there's no answer or it's empty, the condition is not met
    const answer = answers[rule.questionId];
    if (
      answer === undefined ||
      answer === null ||
      (typeof answer === "string" && answer === "") ||
      (Array.isArray(answer) && answer.length === 0)
    ) {
      console.log("No answer for this question, returning false");
      return false;
    }

    // Find the question to determine its type
    const question = allFields.find((q) => q[1] === rule.questionId);
    if (!question) {
      console.log("Question not found, returning false");
      return false;
    }

    try {
      const answerSettings = JSON.parse(question[5] || "{}") as AnswerSettings;
      const questionType = answerSettings.renderElement || "shortText";

      // Get answer and rule value as strings for text comparisons
      const answerStr = String(answer);
      const ruleValueStr = String(rule.value);
      
      console.log(`Question type: ${questionType}, Answer: ${answerStr}, Expected: ${ruleValueStr}, Operator: ${rule.operator || "equals"}`);

      // Handle different question types and operators
      switch (questionType) {
        case "checkboxes":
          // For checkboxes, check if all required values are selected
          const selectedValues = Array.isArray(answer) ? answer : [answer];
          const requiredValues = Array.isArray(rule.value)
            ? rule.value
            : [rule.value];

          if (rule.operator === "notEquals") {
            // At least one required value is not selected
            const result = !requiredValues.every((value) =>
              selectedValues.includes(value)
            );
            console.log(`Checkbox notEquals result: ${result}`);
            return result;
          }
          // Default is "equals": all required values are selected
          const result = requiredValues.every((value) =>
            selectedValues.includes(value)
          );
          console.log(`Checkbox equals result: ${result}`);
          return result;

        case "radioButton":
        case "dropdown":
          // For single-select questions
          if (rule.operator === "notEquals") {
            const result = answerStr !== ruleValueStr;
            console.log(`Radio/Dropdown notEquals result: ${result}`);
            return result;
          }
          const radioResult = answerStr === ruleValueStr;
          console.log(`Radio/Dropdown equals result: ${radioResult}`);
          return radioResult;

        case AnswerTypes.number:
          // For numbers, apply the appropriate comparison operator
          const numAnswer = Number(answer);
          const numValue = Number(rule.value);

          if (isNaN(numAnswer) || isNaN(numValue)) {
            console.log("NaN detected in number comparison, returning false");
            return false;
          }

          let numResult = false;
          switch (rule.operator) {
            case "notEquals":
              numResult = numAnswer !== numValue;
              break;
            case "greaterThan":
              numResult = numAnswer > numValue;
              break;
            case "lessThan":
              numResult = numAnswer < numValue;
              break;
            case "greaterThanEqual":
              numResult = numAnswer >= numValue;
              break;
            case "lessThanEqual":
              numResult = numAnswer <= numValue;
              break;
            case "equals":
            default:
              numResult = numAnswer === numValue;
              break;
          }
          console.log(`Number comparison result: ${numResult}`);
          return numResult;

        case AnswerTypes.date:
        case AnswerTypes.time:
          if (rule.operator === "notEquals") {
            const result = answerStr !== ruleValueStr;
            console.log(`Date/Time notEquals result: ${result}`);
            return result;
          }
          const dateResult = answerStr === ruleValueStr;
          console.log(`Date/Time equals result: ${dateResult}`);
          return dateResult;

        default:
          // Handle text fields with various operators
          let textResult = false;
          switch (rule.operator) {
            case "notEquals":
              textResult = answerStr !== ruleValueStr;
              break;
            case "contains":
              textResult = answerStr.includes(ruleValueStr);
              break;
            case "startsWith":
              textResult = answerStr.startsWith(ruleValueStr);
              break;
            case "endsWith":
              textResult = answerStr.endsWith(ruleValueStr);
              break;
            case "equals":
            default:
              textResult = answerStr === ruleValueStr;
              break;
          }
          console.log(`Text comparison result: ${textResult}`);
          return textResult;
      }
    } catch (error) {
      console.error("Error evaluating rule:", error);
      return false;
    }
  };

  // Evaluate a group of conditions
  const evaluateGroup = (
    group: ConditionGroup,
    answers: Record<string, string | string[]>,
    allFields: Field[]
  ): boolean => {
    console.log("Evaluating group:", group);
    
    if (!group.rules || group.rules.length === 0) {
      console.log("No rules in group, returning true");
      return true;
    }

    // For backward compatibility with simple rule arrays
    if (Array.isArray(group.rules) && group.rules.length > 0 && "questionId" in group.rules[0]) {
      // Simple array of rules - if ANY rule passes, return true (OR logic)
      const result = (group.rules as ConditionRule[]).some(rule => {
        const ruleResult = evaluateRule(rule, answers, allFields);
        console.log(`Simple rule evaluation: ${ruleResult}`);
        return ruleResult;
      });
      console.log(`Simple rules array result: ${result}`);
      return result;
    }

    // Advanced evaluation with AND/OR logic
    let result = isConditionRule(group.rules[0])
      ? evaluateRule(group.rules[0] as ConditionRule, answers, allFields)
      : evaluateGroup(group.rules[0] as ConditionGroup, answers, allFields);
    
    console.log(`First rule/group result: ${result}`);

    // Evaluate the rest of the rules, applying the appropriate logic operator
    for (let i = 1; i < group.rules.length; i++) {
      const prevRule = group.rules[i - 1];
      const currentRule = group.rules[i];

      // Get the logic type from the previous rule or default to AND
      const logicType = isConditionRule(prevRule)
        ? (prevRule as ConditionRule).nextLogic
        : (prevRule as ConditionGroup).nextLogic || "AND";
      
      console.log(`Logic type between rules ${i-1} and ${i}: ${logicType}`);
      
      // Evaluate the current rule
      const currentResult = isConditionRule(currentRule)
        ? evaluateRule(currentRule as ConditionRule, answers, allFields)
        : evaluateGroup(currentRule as ConditionGroup, answers, allFields);
      
      console.log(`Rule/group ${i} result: ${currentResult}`);

      // Apply the logic operator
      if (logicType === "AND") {
        result = result && currentResult;
        console.log(`AND operation result: ${result}`);
      } else {
        // OR logic
        result = result || currentResult;
        console.log(`OR operation result: ${result}`);
      }
    }

    console.log(`Final group evaluation result: ${result}`);
    return result;
  };

  // Determine if a question should be displayed based on conditions
  const shouldShowQuestion = (question: Field): boolean => {
    try {
      console.log("Evaluating question:", question[3]);
      const answerSettings = JSON.parse(question[5] || "{}") as AnswerSettings;
      const conditions = answerSettings.conditions;
      console.log("Conditions:", conditions);
      console.log("Current answers:", formAnswers);

      // If no conditions defined, always show the question
      if (!conditions || !conditions.rules || conditions.rules.length === 0) {
        console.log("No conditions, showing question");
        return true;
      }

      // Evaluate the conditions
      const result = evaluateGroup(conditions, formAnswers, fields);
      console.log(`Should show question ${question[3]}? ${result}`);
      return result;
    } catch (error) {
      console.error("Error in shouldShowQuestion:", error);
      return true; // On error, show the question
    }
  };

  const onSubmit = async (anonymous: boolean = true) => {
    if (!isPreview && (!formId || !pubKey)) {
      throw "Can't submit to a form that has not been published";
    }
    
    let formResponses = form.getFieldsValue(true);
    const responses: Response[] = Object.keys(formResponses).map(
      (fieldId: string) => {
        let answer = null;
        let message = null;
        if (formResponses[fieldId]) [answer, message] = formResponses[fieldId];
        return ["response", fieldId, answer, JSON.stringify({ message })];
      }
    );
    
    // If formEvent and relays exist (non-preview mode), use sendResponses
    if (!isPreview && formEvent) {
      const anonUser = anonymous ? generateSecretKey() : null;
      sendResponses(pubKey!, formId!, responses, anonUser, true, relays).then(
        (res: any) => {
          console.log("Submitted!");
          sendNotification(formTemplate!, responses);
          setFormSubmitted(true);
          setThankYouScreen(true);
        }
      );
    } else {
      // Handle preview mode
      sendNotification(formTemplate!, responses);
      setFormSubmitted(true);
      setThankYouScreen(true);
    }
  };

  const renderSubmitButton = (settingsData: IFormSettings) => {
    if (isPreview) return null;
    if (!formEvent) return null;
    if (allowedUsers.length === 0) {
      return (
        <SubmitButton
          selfSign={settingsData.disallowAnonymous}
          edit={false}
          onSubmit={onSubmit}
          form={form}
          relays={getResponseRelays(formEvent)}
          formEvent={formEvent}
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
          onSubmit={onSubmit}
          form={form}
          relays={getResponseRelays(formEvent)}
          formEvent={formEvent}
        />
      );
    }
  };

  // Effect to update fields when form template changes
  useEffect(() => {
    if (formTemplate) {
      const name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
      const settingsData = JSON.parse(
        formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}"
      ) as IFormSettings;
      const extractedFields = formTemplate.filter((tag) => tag[0] === "field") as Field[];
      
      setFormName(name);
      setSettings(settingsData);
      setFields(extractedFields);
    }
  }, [formTemplate]);

  // Effect to filter visible fields when fields or answers change
  useEffect(() => {
    if (fields.length > 0) {
      const filtered = fields.filter(shouldShowQuestion);
      console.log(`Filtering fields: ${fields.length} total, ${filtered.length} visible`);
      setVisibleFields(filtered);
    }
  }, [fields, formAnswers]);

  // Effect to initialize form
  useEffect(() => {
    if (!(pubKey && formId)) {
      return;
    }
    initialize(pubKey, formId, relays);
  }, [pubKey, formId]);

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
  } 
  
  if (!isPreview && formEvent?.content !== "" && !userPubKey && !viewKeyParams) {
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
                formTitle={formName}
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
                  fields={visibleFields}
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
            <Text>Response Submitted</Text>
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
};