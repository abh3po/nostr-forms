import { useEffect, useState } from "react";
import { Event, getPublicKey, nip19, nip44, SubCloser } from "nostr-tools";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchFormResponses } from "../../nostr/responses";
import SummaryStyle from "./summary.style";
import { Button, Card, Divider, Table, Typography, Modal, Descriptions, Space } from "antd";
import ResponseWrapper from "./Responses.style";
import { isMobile } from "../../utils/utility";
import { useProfileContext } from "../../hooks/useProfileContext";
import { fetchFormTemplate } from "../../nostr/fetchFormTemplate";
import { hexToBytes } from "@noble/hashes/utils";
import { fetchKeys, getAllowedUsers, getFormSpec } from "../../utils/formUtils";
import { Export } from "./Export";
import { Field, Tag } from "../../nostr/types";
import { useApplicationContext } from "../../hooks/useApplicationContext";
import { ResponseDetailModal } from '../ResponsesNew/components/ResponseDetailModal';
import { getDefaultRelays } from "../../nostr/common";
import { getResponseRelays } from "../../utils/ResponseUtils";

const { Text } = Typography;

type ResponseDetailItem = {
  key: string; 
  question: string;
  answer: string;
};

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
  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  let { poolRef } = useApplicationContext();

  const handleResponseEvent = (event: Event) => {
    console.log("Got a response", event);
    setResponses((prev: Event[] | undefined) => {
      if (prev?.some(e => e.id === event.id)) {
        return prev;
      }
      return [...(prev || []), event];
    });
  };

  const initialize = async () => {
    if (!formId) return;

    if (!(pubKey || secretKey)) return;
    if(!poolRef?.current) return
    if (secretKey) {
      setEditKey(secretKey);
      pubKey = getPublicKey(hexToBytes(secretKey));
    }
    let relay = searchParams.get("relay");
    fetchFormTemplate(
      pubKey!,
      formId,
      poolRef.current,
      async (event: Event) => {
        setFormEvent(event);
        if (!secretKey) {
          if (userPubkey) {
            let keys = await fetchKeys(event.pubkey, formId!, userPubkey);
            let editKey = keys?.find((k) => k[0] === "EditAccess")?.[1] || null;
            setEditKey(editKey);
          }
        }
        let formRelays = getResponseRelays(event);
        const formSpec = await getFormSpec(
          event,
          userPubkey,
          null,
          viewKeyParams
        );
        setFormSpec(formSpec);
      },
      relay ? [relay!] : undefined
    );
  };

  useEffect(() => {
    if (!formEvent) initialize();
    return () => {
      if (responseCloser) responseCloser.close();
    };
  }, [poolRef]);

  useEffect(() => {
    console.log("not working?", formEvent, formId);
    if (!formEvent) return;
    if (!formId) return;
    if (responses) return;
    let allowedPubkeys;
    let pubkeys = getAllowedUsers(formEvent);
    if (pubkeys.length !== 0) allowedPubkeys = pubkeys;
    let formRelays = getResponseRelays(formEvent);
    let responseCloser = fetchFormResponses(
      formEvent.pubkey,
      formId,
      poolRef.current,
      handleResponseEvent,
      allowedPubkeys,
      formRelays
    );
    setResponsesCloser(responseCloser);
  }, [formEvent]);

  useEffect(() => {
    if (!(pubKey || secretKey) || !formId || !poolRef?.current) return;
    if (responses === undefined && formEvent === undefined) {
      initialize();
    }
    return () => {
      if (responseCloser) responseCloser.close();
    };
  }, [pubKey, formId, secretKey, poolRef, userPubkey, viewKeyParams]);

  const getResponderCount = () => {
    if (!responses) return 0;
    return new Set(responses.map((r) => r.pubkey)).size;
  };

  const getInputs = (responseEvent: Event): Tag[] => {
    if (responseEvent.content === "") {
      return responseEvent.tags.filter((tag): tag is Tag => Array.isArray(tag) && tag[0] === "response");
    } else if (editKey) {
      try {
        let conversationKey = nip44.v2.utils.getConversationKey(
          editKey,
          responseEvent.pubkey
        );
        let decryptedContent = nip44.v2.decrypt(
          responseEvent.content,
          conversationKey
        );
         const parsed = JSON.parse(decryptedContent);
         if(Array.isArray(parsed)) {
             return parsed.filter(
               (tag: Tag): tag is Tag => Array.isArray(tag) && tag[0] === "response"
             );
         }
         return [];
      } catch (e) {
          console.error("Failed to parse decrypted response content:", e);
          return [];
      }
    } else {
      console.warn("Cannot decrypt response: EditKey not available.");
      return [];
    }
  };

  const handleRowClick = (record: any) => {
     const authorPubKey = record.key;
     if (!responses) return;
     const authorEvents = responses.filter(event => event.pubkey === authorPubKey);
     if (authorEvents.length === 0) return;
     const latestEvent = authorEvents.sort((a, b) => b.created_at - a.created_at)[0];

     setSelectedEventForModal(latestEvent);
     setIsModalOpen(true);
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
        if (!Array.isArray(input) || input.length < 2) return;
        let questionField = formSpec.find(
          (t) => t[0] === "field" && t[1] === input[1]
        );
        let question = questionField?.[3];
        const label = useLabels ? question || input[1] : input[1];
        let responseLabel = input[2] || "";
        if (questionField && questionField[2] === "option") {
          let choices = JSON.parse(questionField[4]) as Tag[];
          let choiceField = choices.filter((choice) => {
            return choice[0] === input[2];
          })?.[0];
          if (choiceField && choiceField[1]) responseLabel = choiceField[1];
          if (input.length > 3) {
            try {
              const metadata = JSON.parse(input[3] || "{}");
              if (metadata.message) {
                const otherChoice = choices.find(c => { try { return JSON.parse(c[2] || '{}')?.isOther === true; } catch { return false; } });
                if (otherChoice && input[2].split(';').includes(otherChoice[0])) {
                  responseLabel += ` (${metadata.message})`;
                }
              }
            } catch {}
          }
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
      responseTags.forEach((t: Tag) => {
        if (Array.isArray(t) && t.length > 1) uniqueQuestionIds.add(t[1]);
      });
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
        dataIndex: label || fieldId,
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
    if (formSpec === null && responses && uniqueQuestionIds.size > 0) {
      uniqueQuestionIds.forEach(id => {
        columns.push({ key: id, title: `Question ID: ${id}`, dataIndex: id, width: 1.5 });
      });
    }
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
                {responses === undefined ? "Searching..." : getResponderCount()}{" "}
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
            dataSource={getData(true)}
            pagination={false}
            loading={{
              spinning: responses === undefined,
              tip: "🔎 Looking for responses...",
            }}
            scroll={{ x: isMobile() ? 900 : 1500, y: "calc(65% - 400px)" }}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  event.stopPropagation();
                  handleRowClick(record);
                },
                style: { cursor: 'pointer' }
              };
            }}
          />
        </div>
      </ResponseWrapper>
      <ResponseDetailModal
       isVisible={isModalOpen}
       onClose={() => {
           setIsModalOpen(false);
           setSelectedEventForModal(null);
       }}
       event={selectedEventForModal}
       formSpec={formSpec}
       editKey={editKey}
   />
    </div>
  );
};
