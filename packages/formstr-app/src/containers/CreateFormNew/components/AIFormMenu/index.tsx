import { useState } from "react";
import { Button, Modal } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import AIFormGenerator from "../AIFormGenerator";

function AIFormMenu() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    // Store form generation data to persist between modal sessions
    const [savedPrompt, setSavedPrompt] = useState('');
    const [savedResponse, setSavedResponse] = useState<string | null>(null);
    const [savedFormType, setSavedFormType] = useState('survey');

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setShowSettings(false); // Reset settings visibility when closing
    };
    const toggleSettings = () => setShowSettings(!showSettings);

    // Handle successful form generation
    const handleFormGenerated = (prompt: string, response: string, formType: string) => {
        // Save the current values
        setSavedPrompt(prompt);
        setSavedResponse(response);
        setSavedFormType(formType);
        
        // Auto-close the modal
        setIsModalOpen(false);
    };

    return (
        <>
            <div style={{ padding: "10px" }}>
                <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleOpenModal}
                >
                    Generate with AI
                </Button>
            </div>

            <Modal
                title="AI Form Generator"
                open={isModalOpen}
                onCancel={handleCloseModal}
                width={700}
                footer={null}
                destroyOnClose={false}
            >
                <Button onClick={toggleSettings}>
                    {showSettings ? 'Hide Settings' : 'Show Settings'}
                </Button>
                <AIFormGeneratorWrapper 
                    showSettings={showSettings}
                    initialPrompt={savedPrompt}
                    initialResponse={savedResponse}
                    initialFormType={savedFormType}
                    onFormGenerated={handleFormGenerated}
                />
            </Modal>
        </>
    );
}

// Wrapper component to handle showing/hiding settings
const AIFormGeneratorWrapper = ({ 
    showSettings, 
    initialPrompt,
    initialResponse,
    initialFormType,
    onFormGenerated
}: { 
    showSettings: boolean,
    initialPrompt: string,
    initialResponse: string | null,
    initialFormType: string,
    onFormGenerated: (prompt: string, response: string, formType: string) => void
}) => {
    return (
        <AIFormGenerator 
            hideSettings={!showSettings} 
            initialPrompt={initialPrompt}
            initialResponse={initialResponse}
            initialFormType={initialFormType}
            onFormGenerated={onFormGenerated}
        />
    );
};

export default AIFormMenu;