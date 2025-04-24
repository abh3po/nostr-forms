import { Modal } from 'antd';

import ThankYouStyle from './thankyou.style';

export const ThankYouScreen = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal open={isOpen} onCancel={onClose} closable={true} footer={null}>
      <ThankYouStyle>
        <div className="thank-you-image-container">
          <img
            src="https://image.nostr.build/ab238249194e61952d5d199f9595c88da1ba6b1e3d981232e9dc4821a19908fe.gif"
            className="thank-you-image"
            alt="Thank you"
          />
        </div>
      </ThankYouStyle>
    </Modal>
  );
};
