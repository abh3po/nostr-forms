// ZapQRCodeModal.tsx
import { useEffect } from "react";
import { Modal, Typography } from "antd";
import * as QRCode from "qrcode.react";
import { appConfig } from "../../../../../config";

const { Text } = Typography;

export const ZapQRCodeModal = ({
  open,
  invoice,
  hash,
  onSuccess,
  onClose,
}: {
  open: boolean;
  invoice: string;
  hash: string;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  useEffect(() => {
    console.log("GOT Hash as", hash);
    if (!hash) return;
    const ws = new WebSocket(`${appConfig.wsBaseUrl}/ws?hash=${hash}`);
    console.log("WEBSOCKET IS CREATED", ws);
    ws.onmessage = (event) => {
      console.log("RECEIVED A MESSAGE", event);
      const data = JSON.parse(event.data);
      if (data.status === "paid") {
        onSuccess();
        ws.close();
      }
    };

    ws.onerror = console.error;
    return () => ws.close();
  }, [hash]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Scan to Pay">
      <Text>Scan the QR code with your lightning wallet:</Text>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <QRCode.QRCodeSVG value={invoice} size={220} />
        <pre style={{ wordBreak: "break-word", marginTop: 12 }}>{invoice}</pre>
      </div>
    </Modal>
  );
};
