import { Field, Tag, Option, Response } from "@formstr/sdk/dist/formstr/nip101";
import { sendResponses } from "@formstr/sdk/dist/formstr/nip101/sendResponses";
import FillerStyle from "./formFiller.style";
import FormTitle from "../CreateFormNew/components/FormTitle";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Typography } from "antd";
import { ThankYouScreen } from "./ThankYouScreen";
import { SubmitButton } from "./SubmitButton/submit";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";
import { ROUTES as GLOBAL_ROUTES } from "../../constants/routes";
import { ROUTES } from "../../old/containers/MyForms/configs/routes";
import Markdown from "react-markdown";
import {
  Event,
  SimplePool,
  UnsignedEvent,
  generateSecretKey,
} from "nostr-tools";
import { FormFields } from "./FormFields";
import { PrepareForm } from "./PrepareForm";
import { hexToBytes } from "@noble/hashes/utils";
import { RequestAccess } from "./RequestAccess";
import { CheckRequests } from "./CheckRequests";
import { getDefaultRelays, getUserPublicKey } from "@formstr/sdk";

const { Text } = Typography;

interface FormFillerProps {
  formSpec?: Tag[];
  embedded?: boolean;
}

export const FormFiller: React.FC<FormFillerProps> = ({
  formSpec,
  embedded,
}) => {
  const { pubKey, formId } = useParams();
  const [formTemplate, setFormTemplate] = useState<Tag[] | null>(
    formSpec || null
  );
  const [form] = Form.useForm();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [keys, setKeys] = useState<Array<string> | undefined>();
  const [thankYouScreen, setThankYouScreen] = useState(false);
  const [votingKey, setVotingKey] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] =
    useState<boolean>(false);
  const [submitAccess, setSubmitAccess] = useState(true);
  const [signingKey, setSigningKey] = useState<string | undefined>();
  const [formEvent, setFormEvent] = useState<Event | undefined>();
  const [searchParams] = useSearchParams();
  const hideTitleImage = searchParams.get("hideTitleImage") === "true";
  const hideDescription = searchParams.get("hideDescription") === "true";
  const navigate = useNavigate();

  const isPreview = !!formSpec;

  if (!formId && !formSpec) {
    return null;
  }

  const fetchKeys = async (formAuthor: string, formId: string) => {
    const userPublicKey = await getUserPublicKey(null);
    const pool = new SimplePool();
    let defaultRelays = getDefaultRelays();
    let giftWrapsFilter = {
      kinds: [1059],
      "#t": ["formAccess"],
      "#p": [userPublicKey],
    };
    let userRelaysFilter = {
      kinds: [10050],
      "#p": [userPublicKey],
    };
    const relayListEvent = await pool.get(defaultRelays, userRelaysFilter);
    const relayList = relayListEvent?.tags
      .filter((tag: Tag) => tag[0] === "relay")
      .map((t) => t[1]);

    const accessKeyEvents = pool.querySync(
      relayList || defaultRelays,
      giftWrapsFilter
    );
    (await accessKeyEvents).forEach(async (keyEvent: Event) => {
      const sealString = await window.nostr.nip44.decrypt(
        keyEvent.pubkey,
        keyEvent.content
      );
      const seal = JSON.parse(sealString) as Event;
      const rumorString = await window.nostr.nip44.decrypt(
        seal.pubkey,
        seal.content
      );
      const rumor = JSON.parse(rumorString) as UnsignedEvent;
      let formRumor = rumor.tags.find(
        (t) => t[0] === "a" && t[1] === `30168:${formAuthor}:${formId}`
      );
      if (formRumor) {
        let key = rumor.tags.find((t) => t[0] === "key");
        setKeys(key);
        return;
      }
    });
  };

  useEffect(() => {
    if (!(pubKey && formId)) {
      return;
    }
    if (!keys) {
      fetchKeys(pubKey, formId);
    }
  }, []);

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

  const isPoll = (tags?: Tag[]) => {
    if (!formTemplate && !tags) return;
    else {
      const settingsTag = (formTemplate || tags)!.find(
        (tag) => tag[0] === "settings"
      );
      if (!settingsTag) return;
      const settings = JSON.parse(settingsTag[1] || "{}");
      return settings.isPoll;
    }
  };

  const checkVoterEligible = async (formEvent: Event) => {
    console.log("isPoll? ", isPoll(formEvent.tags));
    if (!isPoll(formEvent.tags)) return;
    setCheckingEligibility(true);
    if (!keys) {
      return false;
    } else if (keys && keys[3]) {
      setVotingKey(keys[3]);
    }
  };

  const checkSigningKey = async (formEvent: Event) => {
    if (!keys) return;
    setSigningKey(keys[2]);
  };

  const saveResponse = async (anonymous: boolean = true) => {
    if (!formId || !pubKey) {
      throw "Cant submit to a form that has not been published";
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
    let anonUser = null;
    if (votingKey) anonUser = hexToBytes(votingKey);
    if (!votingKey && anonymous) {
      anonUser = generateSecretKey();
    }
    sendResponses(pubKey, formId, responses, anonUser, !isPoll()).then(
      (val) => {
        console.log("Submitted!");
        setFormSubmitted(true);
        setThankYouScreen(true);
      },
      (err) => {
        console.log("some error", err);
      }
    );
  };

  if ((!pubKey || !formId) && !isPreview) {
    return <Text>INVALID FORM URL</Text>;
  }
  if (!formTemplate && !isPreview) {
    return (
      <PrepareForm
        pubKey={pubKey!}
        formId={formId!}
        formSpecCallback={function (fields: Tag[], formEvent: Event): void {
          setFormTemplate(fields);
          checkVoterEligible(formEvent);
          checkSigningKey(formEvent);
          setFormEvent(formEvent);
        }}
      />
    );
  }
  let name: string, settings: any, fields: Field[];
  if (formTemplate) {
    name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
    settings = JSON.parse(
      formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}"
    );
    fields = formTemplate.filter((tag) => tag[0] === "field") as Field[];

    console.log("submitAccess", submitAccess, "votingKey", votingKey);
    return (
      <FillerStyle $isPreview={isPreview}>
        {signingKey && !isPreview ? (
          <CheckRequests
            pubkey={pubKey!}
            formId={formId!}
            secretKey={signingKey}
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
                  <FormFields fields={fields} handleInput={handleInput} />
                  <>
                    {submitAccess || votingKey ? (
                      <SubmitButton
                        selfSign={settings.disallowAnonymous}
                        edit={false}
                        onSubmit={saveResponse}
                        form={form}
                        disabled={
                          isPreview || (checkingEligibility && !votingKey)
                        }
                        disabledMessage={
                          checkingEligibility && !votingKey
                            ? "Checking Eligibilty"
                            : "Disabled"
                        }
                      />
                    ) : (
                      <RequestAccess pubkey={pubKey!} formId={formId!} />
                    )}
                  </>
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
                let navigationUrl = isPoll()
                  ? `/r/${pubKey}/${formId}`
                  : `${GLOBAL_ROUTES.MY_FORMS}/${ROUTES.SUBMISSIONS}`;
                console.log("navigation url", navigationUrl);
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
