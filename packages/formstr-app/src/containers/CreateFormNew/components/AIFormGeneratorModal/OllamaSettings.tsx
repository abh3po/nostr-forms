import React from 'react';
import { Input, Space, Typography, Tooltip, Collapse, Row, Col, Divider as AntDivider } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { OllamaSettingsProps } from './types';
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

const { Text, Paragraph, Link, Title } = Typography;
const { Panel } = Collapse;
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto', marginTop: '8px', marginBottom: '8px' }}>
    <code>{children}</code>
  </pre>
);

const OllamaSettings: React.FC<OllamaSettingsProps> = ({
  ollamaUrl,
  onUrlChange,
  onTestConnection,
  loading,
}) => {
  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div>
        <Space align="center" style={{ marginBottom: 4 }}>
          <Text strong>Ollama Server URL</Text>
          <Tooltip title="The base URL of your running Ollama instance (e.g., http://localhost:11434). Connection will be tested automatically when you click away/blur from this field.">
            <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)', cursor: 'help' }} />
          </Tooltip>
        </Space>
        <Input
          placeholder="e.g., http://localhost:11434"
          value={ollamaUrl}
          onChange={onUrlChange}
          onBlur={onTestConnection}
          disabled={loading}
          aria-label="Ollama Server URL"
        />
      </div>

      <Collapse ghost style={{ width: '100%', margin: '0' }}>
        <Panel header={<Text type="secondary">Show Ollama Setup Steps</Text>} key="1">
          <Paragraph>
            To use the AI form generation feature with your local Ollama instance, follow the steps below for your operating system.
          </Paragraph>
          <AntDivider />

          <Title level={5}>1. Download Ollama & Pull Model (All Platforms)</Title>
          <Paragraph>
            Download and install Ollama from the official site:
            <br />
            <Link href="https://ollama.com/download" target="_blank" rel="noopener noreferrer">
              https://ollama.com/download
            </Link>
          </Paragraph>
          <Paragraph>
            After installation, open your terminal (macOS/Linux/WSL/Windows PowerShell) and pull a model:
          </Paragraph>
          <CodeBlock>ollama pull llama3</CodeBlock>
          <Paragraph type="secondary">(e.g., <Text code>llama3</Text>, or your preferred model)</Paragraph>
          <AntDivider />
          <Title level={5}>2. Start Ollama Server (macOS / Linux / Windows)</Title>
          <Paragraph>
            Use the command block below based on your platform to start the Ollama server:
            Make sure to <Text strong>restart Ollama</Text> after setting these environment variables if it's already running.
          </Paragraph>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Text strong>macOS / Linux / WSL</Text>
              <CodeBlock>
                export OLLAMA_HOST=0.0.0.0:11434{'\n'}
                export OLLAMA_ORIGINS='{currentOrigin}'{'\n'}
                ollama serve
              </CodeBlock>
            </Col>

            <Col xs={0} md={1}>
              <AntDivider type="vertical" style={{ height: '100%' }} />
            </Col>

            <Col xs={24} md={11}>
              <Text strong>Windows (PowerShell)</Text>
              <CodeBlock>
                $env:OLLAMA_HOST="0.0.0.0:11434"{'\n'}
                $env:OLLAMA_ORIGINS="{currentOrigin}"{'\n'}
                ollama serve
              </CodeBlock>
            </Col>
          </Row>
          <Paragraph type="secondary" style={{ marginTop: '12px' }}>
            <Text strong>Note for Linux users (Persistence):</Text> If Ollama was installed as a system service, you might need to edit the service file to make these environment variables persistent.
            For example, you might edit <Text code>/etc/systemd/system/ollama.service</Text> and add the variables under the <Text code>[Service]</Text> section, like so:
            <CodeBlock>
              [Service]{'\n'}
              Environment="OLLAMA_HOST=0.0.0.0:11434"{'\n'}
              Environment="OLLAMA_ORIGINS=https://formstr.app,http://localhost:3000"{'\n'}
            </CodeBlock>
            Then, reload the systemd daemon and restart Ollama:
            <CodeBlock>
              sudo systemctl daemon-reload{'\n'}
              sudo systemctl restart ollama
            </CodeBlock>
          </Paragraph>

          <AntDivider style={{ marginTop: '20px' }} />

          <Paragraph style={{ marginTop: '20px', textAlign: 'center' }}>
            After completing these steps, the "Ollama Server URL" (usually <Text code>http://localhost:11434</Text>) should connect successfully.
          </Paragraph>
        </Panel>
      </Collapse>
    </Space>
  );
};

export default OllamaSettings;