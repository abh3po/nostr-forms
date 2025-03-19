// src/components/FAQModal.tsx
import { Modal, Collapse, Typography } from "antd";

// Destructure to access CollapsePanel
const { Panel } = Collapse;

interface FAQModalProps {
  visible: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      title="Frequently Asked Questions"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Collapse defaultActiveKey={["1"]}>
        {/* Question 1: What is nostr? */}
        <Panel header="What is nostr?" key="1">
          <Typography.Paragraph>
            NOSTR (Notes and Other Stuff Transmitted by Relays) is a
            decentralized protocol for communication. It allows users to own
            their private keys. Users can create events signed with their
            private keys and share them with other users through relays. These
            events are stored on any number of relays(servers) of the user's
            choice.
          </Typography.Paragraph>
        </Panel>

        {/* Question 2: Where are my forms stored? */}
        <Panel header="Where are my forms stored?" key="2">
          <Typography.Paragraph>
            Your forms are stored on relays. Each form event is signed by a new
            private key to ensure privacy, and for ease of sharing with other
            users (admins / participants). If you are not logged in to formstr
            then the only copy of this private key is stored on your browsers
            local storage. If you are logged in, then your form keys are also
            encrypted and stored on nostr relays as a nostr list event. This
            ensures that you can access your forms on any device as long as you
            are logged into it.
          </Typography.Paragraph>
        </Panel>

        {/* Question 3: How do I login? */}
        <Panel header="Do I need to login to use Formstr?" key="3">
          <Typography.Paragraph>
            To log in, you need a public key (pubkey). If you don’t have one,
            you can generate it by clicking the "Login" button. Once you have
            your pubkey, you can log in and access your forms and settings.
          </Typography.Paragraph>
        </Panel>
        <Panel header="How do I login?" key="3">
          <Typography.Paragraph>
            To log in, you need a public key (pubkey). If you don’t have one,
            you can generate it by clicking the "Login" button. Once you have
            your pubkey, you can log in and access your forms and settings.
          </Typography.Paragraph>
        </Panel>
      </Collapse>
    </Modal>
  );
};

export default FAQModal;
