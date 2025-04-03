import { useEffect, useState } from "react";
import { Event, getPublicKey, nip19, nip44, SubCloser } from "nostr-tools";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchFormResponses } from "../../nostr/responses"
import SummaryStyle from "./summary.style";
import { Button, Card, Divider, Table, Typography } from "antd";
import ResponseWrapper from "./Responses.style";
import { isMobile } from "../../utils/utility";
import { useProfileContext } from "../../hooks/useProfileContext";
import { fetchFormTemplate } from "@formstr/sdk/dist/formstr/nip101/fetchFormTemplate";
import { hexToBytes } from "@noble/hashes/utils";
import { fetchKeys, getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { Export } from "./Export";
import { Field, Tag } from "../../nostr/types";
import { useApplicationContext } from "../../hooks/useApplicationContext";

const { Text } = Typography;

export const Response = () => {
  const [responses, setResponses] = useState<Event[] | undefined>(undefined);
  const [formEvent, setFormEvent] = useState<Event | undefined>(undefined);
  const [formSpec, setFormSpec] = useState<Tag[] | null | undefined>(undefined);
  const [editKey, setEditKey] = useState<string | undefined | null>();
  let { pubKey, formId, secretKey } = useParams();
  let [searchParams] = useSearchParams();
  const { pubkey: userPubkey, requestPubkey } = useProfileContext();
  const viewKeyParams = searchParams.get("viewKey");
  const [responseCloser, setResponsesCloser] = useState<SubCloser | null>(null);
  const handleResponseEvent = (event: Event) => {
    setResponses((prev: Event[] | undefined) => [...(prev || []), event]);
  };
  let { poolRef } = useApplicationContext();

  const initialize = async () => {
    if (!formId) return;

    if (!(pubKey || secretKey)) return;

    if(!poolRef) return

    if (secretKey) {
      setEditKey(secretKey);
      pubKey = getPublicKey(hexToBytes(secretKey));
    }
    let relay = searchParams.get("relay");
    const formEvent = await fetchFormTemplate(
      pubKey!,
      formId,
      relay ? [relay!] : undefined
    );
    if (!formEvent) return;
    if (!secretKey) {
      if (userPubkey) {
        let keys = await fetchKeys(formEvent.pubkey, formId, userPubkey);
        let editKey = keys?.find((k) => k[0] === "EditAccess")?.[1] || null;
        setEditKey(editKey);
      }
    }
    setFormEvent(formEvent);
    const formSpec = await getFormSpec(
      formEvent,
      userPubkey,
      null,
      viewKeyParams
    );
    setFormSpec(formSpec);
    let allowedPubkeys;
    let pubkeys = getAllowedUsers(formEvent);
    if (pubkeys.length !== 0) allowedPubkeys = pubkeys;
    let responseCloser =  fetchFormResponses(
      pubKey!,
      formId,
      poolRef.current,
      handleResponseEvent,
      allowedPubkeys,
      relay ? [relay!] : undefined,
    )
    setResponsesCloser(responseCloser);
  };

  useEffect(() => {
    if (!formEvent && !responses) initialize();
    return () => {
      if (responseCloser) responseCloser.close()
      }
  }, [poolRef]);

  const getResponderCount = () => {
    if (!responses) return 0;
    return new Set(responses.map((r) => r.pubkey)).size;
  };

  const getInputs = (responseEvent: Event) => {
    if (responseEvent.content === "") {
      return responseEvent.tags.filter((tag) => tag[0] === "response");
    } else if (editKey) {
      let conversationKey = nip44.v2.utils.getConversationKey(
        editKey,
        responseEvent.pubkey
      );
      let decryptedContent = nip44.v2.decrypt(
        responseEvent.content,
        conversationKey
      );
      try {
        return JSON.parse(decryptedContent).filter(
          (tag: Tag) => tag[0] === "response"
        );
      } catch (e) {
        return [];
      }
    } else {
      alert("You do not have access to view responses for this form.");
    }
    return [];
  };

  const getData = (useLabels: boolean = false) => {
    let answers: Array<{
      [key: string]: string;
    }> = [];
    if (!formSpec || !responses) return;
    let responsePerPubkey = new Map<string, Event[]>();
    responses.forEach((r: Event) => {
      let existingResponse = responsePerPubkey.get(r.pubkey);
      if (!existingResponse) responsePerPubkey.set(r.pubkey, [r]);
      else responsePerPubkey.set(r.pubkey, [...existingResponse, r]);
    });

    Array.from(responsePerPubkey.keys()).forEach((pub) => {
      let pubkeyResponses = responsePerPubkey.get(pub);
      if (!pubkeyResponses || pubkeyResponses.length == 0) return;
      let response = pubkeyResponses.sort(
        (a, b) => b.created_at - a.created_at
      )[0];
      let inputs = getInputs(response) as Tag[];
      if (inputs.length === 0) return;
      let answerObject: {
        [key: string]: string;
      } = {
        key: response.pubkey,
        createdAt: new Date(response.created_at * 1000).toDateString(),
        authorPubkey: nip19.npubEncode(response.pubkey),
        responsesCount: pubkeyResponses.length.toString(),
      };
      inputs.forEach((input) => {
        let questionField = formSpec.find(
          (t) => t[0] === "field" && t[1] === input[1]
        );
        let question = questionField?.[3];
        const label = useLabels ? question || input[1] : input[1];
        let responseLabel = input[2];
        if (questionField && questionField[2] === "option") {
          let choices = JSON.parse(questionField[4]) as Tag[];
          let choiceField = choices.filter((choice) => {
            return choice[0] === input[2];
          })?.[0];
          if (choiceField[1]) responseLabel = choiceField[1];
        }
        answerObject[label] = responseLabel;
      });
      answers.push(answerObject);
    });
    return answers;
  };

  const getFormName = () => {
    if (!formSpec) return "Form Details Unnaccessible";

    let nameTag = formSpec.find((tag) => tag[0] === "name");
    if (nameTag) return nameTag[1] || "";
    return "";
  };

  const getColumns = () => {
    const columns: Array<{
      key: string;
      title: string;
      dataIndex: string;
      fixed?: "left" | "right";
      width?: number;
      render?: (data: string) => JSX.Element;
    }> = [
      {
        key: "author",
        title: "Author",
        fixed: "left",
        dataIndex: "authorPubkey",
        width: 1.2,
        render: (data: string) => (
          <a
            href={`https://njump.me/${data}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data}
          </a>
        ),
      },
      {
        key: "responsesCount",
        title: "Submissions",
        dataIndex: "responsesCount",
        width: 1.2,
      },
    ];
    const rightColumns: Array<{
      key: string;
      title: string;
      dataIndex: string;
      fixed?: "left" | "right";
      width?: number;
      render?: (data: string) => JSX.Element;
    }> = [
      {
        key: "createdAt",
        title: "Created At",
        dataIndex: "createdAt",
        width: 1,
      },
    ];
    let uniqueQuestionIds: Set<string> = new Set();
    responses?.forEach((response: Event) => {
      let responseTags = getInputs(response);
      responseTags.forEach((t: Tag) => uniqueQuestionIds.add(t[1]));
    });
    let fields =
      formSpec?.filter((field) => field[0] === "field") || ([] as Field[]);

    let extraFields = Array.from(uniqueQuestionIds).filter(
      (f) => !fields.map((field) => field[1]).includes(f)
    );
    fields.forEach((field) => {
      let [_, fieldId, __, label, ___, ____] = field;
      columns.push({
        key: fieldId,
        title: label,
        dataIndex: fieldId,
        width: 1.5,
      });
    });
    extraFields.forEach((q) => {
      columns.push({
        key: q,
        title: q,
        dataIndex: q,
        width: 1.5,
      });
    });
    return [...columns, ...rightColumns];
  };

  if (!(pubKey || secretKey) || !formId) return <Text>Invalid url</Text>;

  if (formEvent && formEvent.content !== "" && !userPubkey && !viewKeyParams)
    return (
      <>
        <Text>This form is private, you need to login to view the form</Text>
        <Button
          onClick={() => {
            requestPubkey();
          }}
        >
          {" "}
          login{" "}
        </Button>
      </>
    );

  return (
    <div>
      <SummaryStyle>
        <div className="summary-container">
          <Card>
            <Text className="heading">{getFormName()}</Text>
            <Divider />
            <div className="response-count-container">
              <Text className="response-count">
                {responses ? getResponderCount() : "Searching for Responses.."}{" "}
              </Text>
              <Text className="response-count-label">responder(s)</Text>
            </div>
          </Card>
        </div>
      </SummaryStyle>
      <ResponseWrapper>
        <Export responsesData={getData(true) || []} formName={getFormName()} />
        <div style={{ overflow: "scroll", marginBottom: 60 }}>
          <Table
            columns={getColumns()}
            dataSource={getData()}
            pagination={false}
            loading={{
              spinning: !!!responses,
              tip: "🔎 Looking for your responses...",
            }}
            scroll={{ x: isMobile() ? 900 : 1500, y: "calc(65% - 400px)" }}
          />
        </div>
      </ResponseWrapper>
    </div>
  );
};
