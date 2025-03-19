// src/components/FAQModal.tsx
import { Modal, Collapse, Typography, Spin, ConfigProvider } from "antd";
import { ReactPropTypes, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CaretRightOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useToken } from "antd/es/theme/internal";

const { Panel } = Collapse;

interface FAQModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Styled components with Antd theme tokens
const ModalBody = styled.div<{ token: any }>`
  padding: ${(props) => props.token.paddingLG}px;
  background: ${(props) => props.token.colorBgContainerDisabled};
  border-radius: ${(props) => props.token.borderRadiusLG}px;
`;

const ContentWrapper = styled.div`
  min-height: 250px;
`;

const LoadingWrapper = styled.div<{ token: any }>`
  text-align: center;
  padding: ${(props) => props.token.paddingXL}px 0;
`;

const ErrorWrapper = styled.div<{ token: any }>`
  padding: ${(props) => props.token.paddingMD}px;
  background: ${(props) => props.token.colorErrorBg};
  border-radius: ${(props) => props.token.borderRadiusMD}px;
  box-shadow: 0 2px 8px ${(props) => props.token.boxShadowTertiary};

  & h4 {
    color: ${(props) => props.token.colorError};
    margin-bottom: ${(props) => props.token.marginXS}px;
  }
  & p {
    color: ${(props) => props.token.colorError};
  }
`;

const EmptyWrapper = styled.div<{ token: any }>`
  padding: ${(props) => props.token.paddingMD}px;
  background: ${(props) => props.token.colorWarningBg};
  border-radius: ${(props) => props.token.borderRadiusMD}px;
  box-shadow: 0 2px 8px ${(props) => props.token.boxShadowTertiary};

  & h4 {
    color: ${(props) => props.token.colorWarning};
    margin-bottom: ${(props) => props.token.marginXS}px;
  }
  & p {
    color: ${(props) => props.token.colorWarning};
  }
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
  overflow: hidden;
`;

const PanelHeader = styled.span<{ token: any }>`
  font-size: ${(props) => props.token.fontSizeLG}px;
  font-weight: 500;
  color: ${(props) => props.token.colorPrimary};
`;

const PanelContent = styled(Typography.Paragraph)<{ token: any }>`
  color: ${(props) => props.token.colorTextSecondary};
`;

const FAQModal: React.FC<FAQModalProps> = ({ visible, onClose }) => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Access Antd theme tokens
  const [, token] = useToken();

  useEffect(() => {
    const fetchFAQContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/docs/faq.md");
        if (!response.ok) {
          throw new Error(`Failed to fetch FAQ content: ${response.status}`);
        }
        const text = await response.text();

        const lines = text.split("\n");
        const items: FAQItem[] = [];
        let currentQuestion = "";
        let currentAnswer = "";

        lines.forEach((line) => {
          if (line.startsWith("## ")) {
            if (currentQuestion) {
              items.push({
                question: currentQuestion,
                answer: currentAnswer.trim(),
              });
            }
            currentQuestion = line.replace("## ", "").trim();
            currentAnswer = "";
          } else if (currentQuestion) {
            currentAnswer += line + "\n";
          }
        });

        if (currentQuestion && currentAnswer) {
          items.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
          });
        }

        setFaqItems(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFAQContent();
  }, []);

  return (
    <Modal
      title={
        <Typography.Title
          level={3}
          style={{ margin: 0, color: token.colorPrimary }}
        >
          Frequently Asked Questions
        </Typography.Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <ModalBody token={token}>
        <ContentWrapper>
          {loading && (
            <LoadingWrapper token={token}>
              <Spin size="large" tip="Loading FAQ..." />
            </LoadingWrapper>
          )}

          {!loading && error && (
            <ErrorWrapper token={token}>
              <Typography.Title level={4}>
                Oops, Something Went Wrong
              </Typography.Title>
              <Typography.Paragraph>{`Failed to load FAQ: ${error}`}</Typography.Paragraph>
            </ErrorWrapper>
          )}

          {!loading && !error && faqItems.length === 0 && (
            <EmptyWrapper token={token}>
              <Typography.Title level={4}>
                No FAQ Content Found
              </Typography.Title>
              <Typography.Paragraph>
                The FAQ file appears to be empty or incorrectly formatted.
              </Typography.Paragraph>
            </EmptyWrapper>
          )}

          {!loading && !error && faqItems.length > 0 && (
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
              {faqItems.map((item, index) => (
                <StyledPanel
                  header={
                    <PanelHeader token={token}>{item.question}</PanelHeader>
                  }
                  key={String(index + 1)}
                  token={token}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <PanelContent token={token}>{children}</PanelContent>
                      ),
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                          {props.children}
                        </a>
                      ),
                    }}
                  >
                    {item.answer}
                  </ReactMarkdown>
                </StyledPanel>
              ))}
            </StyledCollapse>
          )}
        </ContentWrapper>
      </ModalBody>
    </Modal>
  );
};

// Export with ConfigProvider, passing props through
const ThemedFAQModal: React.FC<FAQModalProps> = ({ visible, onClose }) => (
  <ConfigProvider
    theme={{
      token: {
        borderRadiusLG: 12,
      },
    }}
  >
    <FAQModal visible={visible} onClose={onClose} />
  </ConfigProvider>
);

export default ThemedFAQModal;
