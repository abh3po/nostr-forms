import React from 'react';
import { Typography, Collapse } from 'antd';
import { OllamaSettingsProps } from './types';
import './styles.css';

const { Panel } = Collapse;

const OllamaSettings: React.FC<OllamaSettingsProps> = () => {
    return (
        <Collapse ghost>
            <Panel header="Connection Help & Instructions" key="1">
                <Typography.Title level={5} className="settings-title">
                    Step 1: Install the Companion Extension
                </Typography.Title>
                <Typography.Paragraph className="settings-paragraph">
                    This feature requires the Ollama Web <a href="https://github.com/ashu01304/Ollama_Web" target="_blank" rel="noopener noreferrer">
                    Companion browser extension
                    </a> to communicate with your local Ollama instance.
                </Typography.Paragraph>

                <Typography.Title level={5} className="settings-title">
                    Step 2: Allow This Website
                </Typography.Title>
                <Typography.Paragraph className="settings-paragraph-tight">
                    You must explicitly grant this website permission to use the extension.
                    <ol className="settings-list">
                        <li>Open the extension's settings/popup.</li>
                        <li>Find the "Allowed Domains" list.</li>
                        <li>Add the web domain of the website or click on "Add Current".</li>
                    </ol>
                </Typography.Paragraph>
                 <Typography.Paragraph strong className="settings-final-paragraph">
                    After completing these steps, click the "Test Connection" button above.
                </Typography.Paragraph>
            </Panel>
        </Collapse>
    );
};

export default OllamaSettings;