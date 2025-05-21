import { useState } from "react";
import { Button, Input, Typography, Alert, Space, Row, Col } from "antd";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "../../../../../utils/axiosInstance";
import { useNostrAuth } from "../../../../../hooks/useNostrAuth";
import { appConfig } from "../../../../../config";
const { Text } = Typography;

export const CustomSlugForm = ({
  formId,
  onInvoiceReady,
  formPubkey,
  relays,
  viewKey,
}: {
  onInvoiceReady: (invoice: string, hash: string, slug: string) => void;
  formId: string;
  formPubkey: string;
  relays: string[];
  viewKey?: string;
}) => {
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { generateAuthHeader, error: authError } = useNostrAuth();

  const checkAvailability = async () => {
    if (!slug) return;
    setChecking(true);
    setAvailable(null);
    setError(null);
    try {
      const formPath = `/api/forms/${slug}`;
      const apiURl = `${appConfig.apiBaseUrl}${formPath}`;
      await axios.get(formPath, { withCredentials: false });
      // If we reach here, form exists → slug is NOT available
      setAvailable(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Form does not exist → slug is available
        setAvailable(true);
      } else {
        setError(err.response?.data?.error || "Server error");
      }
    } finally {
      setChecking(false);
    }
  };

  const handlePay = async () => {
    const payPath = `/api/generateInvoice`;
    const apiURl = `${appConfig.apiBaseUrl}${payPath}`;
    try {
      const authHeader = await generateAuthHeader(apiURl, "POST", {
        slug: slug,
        formId: formId,
        formPubkey,
        relays,
        viewKey,
      });
      const res = await axios.post(
        apiURl,
        { slug, formId, formPubkey, relays, viewKey },
        {
          headers: { Authorization: authHeader },
        }
      );
      const { invoice, paymentHash } = res.data;
      console.log("QR data is", invoice, paymentHash, res.data); // assume backend returns hash
      onInvoiceReady(invoice, paymentHash, slug); // pass hash instead of slug
    } catch (err: any) {
      setError(err.response?.data?.error || "Payment error");
    }
  };

  return (
    <div style={{ marginTop: 32, maxWidth: 400 }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Text strong style={{ fontSize: 16 }}>
          Claim a Custom URL
        </Text>

        <Input
          placeholder="your-custom-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.trim())}
          addonBefore="/t/"
          suffix={
            checking ? (
              <LoadingOutlined />
            ) : available ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : null
          }
        />

        <Row gutter={8}>
          <Col>
            <Button onClick={checkAvailability} disabled={!slug}>
              Check Availability
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={handlePay} disabled={!available}>
              Pay to Claim
            </Button>
          </Col>
        </Row>

        {error && <Alert type="error" message={error} />}
      </Space>
    </div>
  );
};
