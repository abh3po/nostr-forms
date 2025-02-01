import { useState, useEffect } from "react";
import { Button, Card, Divider, Table, Typography } from "antd";
import EmptyScreen from "../../components/EmptyScreen";
import ResponsiveLink from "../../components/ResponsiveLink";
import { IFormSettings, V1Field } from "@formstr/sdk/dist/interfaces";
import { constructFormUrl, isMobile, naddrUrl } from "../../utils/utility";
import StyleWrapper from "./style";
import { getPublicForms } from "../../nostr/publicForms";
import { Event } from "nostr-tools";
import { getDefaultRelays } from "../../nostr/common";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const COLUMNS = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    width: isMobile() ? 25 : 20,
    ellipsis: true,
  },
  {
    key: "description",
    title: "Description",
    dataIndex: "settings",
    width: 35,
    ellipsis: true,
    render: (settings: IFormSettings) => {
      return settings?.description || "-";
    },
    isDisabled: isMobile,
  },
  {
    key: "fields",
    title: "Questions",
    dataIndex: "fields",
    width: isMobile() ? 20 : 15,
    ellipsis: true,
    render: (fields: V1Field[]) => fields.length,
  },
  {
    key: "formUrl",
    title: "Form Url",
    dataIndex: "pubkey",
    width: isMobile() ? 20 : 30,
    ellipsis: true,
    render: (pubkey: string) => {
      let link = constructFormUrl(pubkey);
      return <ResponsiveLink link={link} />;
    },
  },
];

function PublicForms() {
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<Event[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      getPublicForms(getDefaultRelays(), (event: Event) => {
        setForms((events) => [...events, event]);
      });
      setIsLoading(false);
    })();
  }, []);

  return (
    <StyleWrapper>
      {!!forms.length || isLoading ? (
        forms.map((f: Event) => {
          if (f.content === "") {
            let name = f.tags.filter((t) => t[0] === "name")[0][1];
            let formId = f.tags.filter((t) => t[0] === "d")[0][1];
            let settings = JSON.parse(
              f.tags.filter((t) => t[0] === "settings")[0][1]
            );
            return (
              <Card
                title={name}
                style={{
                  fontSize: 12,
                  color: "grey",
                  overflow: "clip",
                  margin: 30,
                }}
              >
                <div style={{ maxHeight: 100, overflow: "clip" }}>
                  <ReactMarkdown>{settings.description}</ReactMarkdown>
                </div>
                <Divider />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    onClick={() => {
                      navigate(naddrUrl(f.pubkey, formId));
                    }}
                    style={{ color: "green", borderColor: "green" }}
                    type="dashed"
                  >
                    Open Form
                  </Button>
                  <Typography.Text style={{ color: "grey" }}>
                    {new Date(f.created_at * 1000).toString()}
                  </Typography.Text>
                </div>
              </Card>
            );
          } else {
            return (
              <Card
                title="Encrypted Content"
                style={{ margin: 30, color: "grey" }}
              >
                {" "}
                {new Date(f.created_at * 1000).toString()}
              </Card>
            );
          }
        })
      ) : (
        <Typography.Text> No forms to show</Typography.Text>
      )}
    </StyleWrapper>
  );
}

export default PublicForms;
