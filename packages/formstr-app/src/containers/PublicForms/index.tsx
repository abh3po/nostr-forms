import { useState, useEffect } from "react";
import { Button, Card, Divider, Table, Typography } from "antd";
import { naddrUrl } from "../../utils/utility";
import StyleWrapper from "./style";
import { getPublicForms } from "../../nostr/publicForms";
import { Event } from "nostr-tools";
import { getDefaultRelays } from "../../nostr/common";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

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
                headStyle={{ marginTop: 10 }}
                style={{
                  fontSize: 12,
                  color: "grey",
                  overflow: "clip",
                  margin: 30,
                }}
              >
                <div
                  style={{
                    maxHeight: 100,
                    textOverflow: "ellipsis",
                  }}
                >
                  <ReactMarkdown>
                    {settings.description.trim().substring(0, 200) + "..."}
                  </ReactMarkdown>
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
                  <Typography.Text
                    style={{ color: "grey", fontSize: 12, margin: 10 }}
                  >
                    {new Date(f.created_at * 1000).toDateString().toString()}
                  </Typography.Text>
                </div>
              </Card>
            );
          } else {
            return (
              <Card
                title="Encrypted Content"
                style={{ margin: 30, fontSize: 12, color: "grey" }}
              >
                {" "}
                {new Date(f.created_at * 1000).toDateString().toString()}
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
