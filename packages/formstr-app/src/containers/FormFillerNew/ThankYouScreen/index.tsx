import { Modal } from "antd";
import ThankYouStyle from "./thankyou.style";
import { CopyButton } from "../../../components/CopyButton";
export const ThankYouScreen = ({
  isOpen,
  onClose,
  submittedAs,
  tempNsec,
}: {
  isOpen: boolean;
  onClose: () => void;
  submittedAs: string;
  tempNsec: string;
}) => {
  return (
    <Modal open={isOpen} onCancel={onClose} closable={true} footer={null}>
      <ThankYouStyle>
        <div className="thank-you-image-container">
          <img
            src="https://image.nostr.build/ab238249194e61952d5d199f9595c88da1ba6b1e3d981232e9dc4821a19908fe.gif"
            className="thank-you-image"
            alt="Thank you"
          />
          <div>
            <div>
              <p>
                <strong>Submitted as:</strong>
                <br />
                <span>{submittedAs}</span>
                <CopyButton 
                  getText={() => submittedAs} 
                  textBefore="" 
                  textAfter="" 
                />
              </p>
              <p>
                <strong>Temporary nsec:</strong> 
                <br />
                <span>{tempNsec}</span>
                <CopyButton 
                  getText={() => tempNsec} 
                  textBefore="" 
                  textAfter="" 
                />
              </p>
            </div>
          </div>
        </div>
      </ThankYouStyle>
    </Modal>
  );
};
