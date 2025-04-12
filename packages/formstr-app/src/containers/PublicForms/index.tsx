import { useState, useEffect } from "react";
import { Button, Card, Divider, Table, Typography, Skeleton } from "antd";
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
    const handleFormEvent = (event: Event) => {
      setForms(prevForms => {
        if (prevForms.some(f => f.id === event.id)) {
          return prevForms;
        }
        return [...prevForms, event];
      });      setIsLoading(false);  
    };

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false); 
  }, 10000); 
  
    setIsLoading(true);
    getPublicForms(getDefaultRelays(), handleFormEvent);

    return () => {
      clearTimeout(loadingTimeout);
    };
    
  }, []);

  return (
    <StyleWrapper>
      {isLoading ? (
        Array(3).fill(0).map((_, index) => (
          <Card key={index} style={{ margin: 30 }}>
            <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 3 }} />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton.Button active style={{ width: 100 }} />
              <Skeleton.Input active style={{ width: 120 }} />
            </div>
          </Card>
        ))
      ) : forms.length > 0 ? (
        forms.map((f: Event) => {
          if (f.content === "") {
            const nameTag = f.tags.find((t) => t[0] === "name");
            const formIdTag = f.tags.find((t) => t[0] === "d");
            const settingsTag = f.tags.find((t) => t[0] === "settings");

            const name = nameTag?.[1] ?? "[Untitled Form]";
            const formId = formIdTag?.[1]; 

            if (!formId) {
              console.warn(`Skipping event without 'd' tag: ${f.id}`);
              return null;
            }

            let settings: { description?: string } = {};
            if (settingsTag?.[1]) {
              try {
                settings = JSON.parse(settingsTag[1]);
              } catch (e) {
                console.warn(`Failed to parse settings for event ${f.id}`, e);
              }
            }

            const description = settings?.description ?? "";
            const truncatedDescription = description.trim().substring(0, 200) + (description.length > 200 ? "..." : "");
            

            return (
              <Card
                key={f.id} 
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
                    overflow: "hidden", 
                  }}
                >
                  <ReactMarkdown>
                    {}
                    {truncatedDescription}
                  </ReactMarkdown>
                </div>
                <Divider />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center", 
                  }}
                >
                  <Button
                    onClick={() => {
                      
                      navigate(naddrUrl(f.pubkey, formId, getDefaultRelays()));
                    }}
                    style={{ color: "green", borderColor: "green" }}
                    type="dashed"
                  >
                    Open Form
                  </Button>
                  <Typography.Text
                    style={{ color: "grey", fontSize: 12, margin: 10 }}
                  >
                    {}
                    {new Date(f.created_at * 1000).toLocaleDateString()}
                  </Typography.Text>
                </div>
              </Card>
            );
          } else {
            
            return (
              <Card
                key={f.id} 
                title="Encrypted Content"
                style={{ margin: 30, fontSize: 12, color: "grey" }}
              >
                {" "}
                {new Date(f.created_at * 1000).toLocaleDateString()}
              </Card>
            );
          }
        })
      ) : (
        
        <Typography.Text style={{ display: 'block', textAlign: 'center', margin: '40px' }}>
          No public forms found on the connected relays.
        </Typography.Text>
      )}
    </StyleWrapper>
  );
}

export default PublicForms;