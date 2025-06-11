// ZapQRCodeModal.tsx
import { useEffect, useRef, useState } from "react";
import { Modal, Typography, Button, Tooltip, message, Spin, Alert } from "antd";
import * as QRCode from "qrcode.react";
import { CopyOutlined } from "@ant-design/icons";
import { appConfig } from "../../../../../config";

const { Text } = Typography;
const MAX_TIME = 300;

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
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "paid" | "error"
  >("pending");
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket>(
    new WebSocket(`${appConfig.wsBaseUrl}/ws?hash=${hash}`)
  );

  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  useEffect(() => {
    if (!hash) return;

    setPaymentStatus("pending");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "paid") {
          setPaymentStatus("paid");
          onSuccess();
          wsRef.current.close();
        }
      } catch {
        // ignore malformed messages
      }
    };

    wsRef.current.onerror = () => {
      setPaymentStatus("error");
    };

    return () => {
      wsRef.current.close();
    };
  }, [hash, onSuccess]);

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice).then(() => {
      setCopied(true);
      message.success("Invoice copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!open) return;

    setTimeLeft(MAX_TIME);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          wsRef.current.close();
          onClose(); // ⏱ Auto-close the modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Format time MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Scan to Pay"
      centered
      bodyStyle={{ textAlign: "center", padding: 24 }}
    >
      <Text>Scan the QR code with your lightning wallet:</Text>

      <div style={{ marginTop: 16 }}>
        <QRCode.QRCodeSVG value={invoice} size={220} />

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <pre
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              padding: 8,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
              fontSize: 12,
              maxWidth: "100%",
              margin: 0,
            }}
          >
            {invoice}
          </pre>

          <Tooltip title={copied ? "Copied!" : "Copy invoice"}>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={copyInvoice}
              style={{ flexShrink: 0 }}
            />
          </Tooltip>
        </div>

        {paymentStatus === "pending" && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Spin />
            <Text>Waiting for payment...</Text>
            <Text type="secondary">Expires in: {formatTime(timeLeft)}</Text>
          </div>
        )}

        {paymentStatus === "error" && (
          <Alert
            type="error"
            message="Error connecting to payment server. Please try again."
            style={{ marginTop: 24 }}
          />
        )}
      </div>
    </Modal>
  );
};
