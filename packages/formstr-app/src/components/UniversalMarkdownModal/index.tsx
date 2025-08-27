// src/components/UniversalMarkdownModal.tsx
import { Modal, Collapse, Typography, Spin, ConfigProvider } from "antd";
import { useEffect, useState } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useToken } from "antd/es/theme/internal";
import SafeMarkdown from "../SafeMarkdown";

const { Panel } = Collapse;

interface Props {
  visible: boolean;
  onClose: () => void;
  filePath: string; // e.g. "/docs/faq.md"
  title: string; // e.g. "FAQ" or "Terms & Privacy"
}

interface Section {
  heading: string;
  body: string;
}

// Styled components
const ModalBody = styled.div<{ token: any }>`
  padding: ${(props) => props.token.paddingLG}px;
  background: ${(props) => props.token.colorBgContainerDisabled};
  border-radius: ${(props) => props.token.borderRadiusLG}px;
`;

const StyledCollapse = styled(Collapse)<{ token: any }>`
  background: transparent;
`;

const StyledPanel = styled(Panel)<{ token: any }>`
  background: ${(props) => props.token.colorBgContainer};
  border-radius: ${(props) => props.token.borderRadiusMD}px;
  margin-bottom: ${(props) => props.token.marginMD}px;
  border: 1px solid ${(props) => props.token.colorBorderSecondary};
  box-shadow: 0 2px 8px ${(props) => props.token.boxShadowTertiary};
`;

const PanelHeader = styled.span<{ token: any }>`
  font-size: ${(props) => props.token.fontSizeLG}px;
  font-weight: 500;
  color: ${(props) => props.token.colorPrimary};
`;

const PanelContent = styled(Typography.Paragraph)<{ token: any }>`
  color: ${(props) => props.token.colorTextSecondary};
`;

const UniversalMarkdownModal: React.FC<Props> = ({
  visible,
  onClose,
  filePath,
  title,
}) => {
  const [rawContent, setRawContent] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, token] = useToken();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(filePath);
        if (!response.ok)
          throw new Error(`Failed to fetch: ${response.status}`);
        const text = await response.text();
        setRawContent(text);

        const lines = text.split("\n");
        const items: Section[] = [];
        let currentHeading = "";
        let currentBody = "";

        lines.forEach((line) => {
          if (line.startsWith("## ")) {
            if (currentHeading) {
              items.push({
                heading: currentHeading,
                body: currentBody.trim(),
              });
            }
            currentHeading = line.replace("## ", "").trim();
            currentBody = "";
          } else if (currentHeading) {
            currentBody += line + "\n";
          }
        });

        if (currentHeading && currentBody) {
          items.push({ heading: currentHeading, body: currentBody.trim() });
        }

        setSections(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filePath]);

  const isCollapsible = sections.length > 0;

  return (
    <Modal
      title={
        <Typography.Title
          level={3}
          style={{ margin: 0, color: token.colorPrimary }}
        >
          {title}
        </Typography.Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <ModalBody token={token}>
        {loading ? (
          <Spin tip="Loading..." />
        ) : error ? (
          <Typography.Text type="danger">{error}</Typography.Text>
        ) : isCollapsible ? (
          <StyledCollapse
            bordered={false}
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined
                rotate={isActive ? 90 : 0}
                style={{ color: token.colorPrimary }}
              />
            )}
            token={token}
          >
            {sections.map((item, idx) => (
              <StyledPanel
                header={<PanelHeader token={token}>{item.heading}</PanelHeader>}
                key={String(idx)}
                token={token}
              >
                <SafeMarkdown
                  components={{
                    p: ({ children }) => (
                      <PanelContent token={token}>{children}</PanelContent>
                    ),
                    a: (props) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {props.children}
                      </a>
                    ),
                  }}
                >
                  {item.body}
                </SafeMarkdown>
              </StyledPanel>
            ))}
          </StyledCollapse>
        ) : (
          <SafeMarkdown>{rawContent}</SafeMarkdown>
        )}
      </ModalBody>
    </Modal>
  );
};

const ThemedUniversalModal: React.FC<Props> = (props) => (
  <ConfigProvider
    theme={{
      token: {
        borderRadiusLG: 12,
      },
    }}
  >
    <UniversalMarkdownModal {...props} />
  </ConfigProvider>
);

export default ThemedUniversalModal;
