import { useState } from "react";
import {
  Button,
  Input,
  Typography,
  Alert,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import axios from "../../../../../utils/axiosInstance";
import { useNostrAuth } from "../../../../../hooks/useNostrAuth";
import { appConfig } from "../../../../../config";
import { useProfileContext } from "../../../../../hooks/useProfileContext";
import { ZapQRCodeModal } from "./zapQRModal";
import { useNavigate } from "react-router-dom";
import UniversalMarkdownModal from "../../../../../components/UniversalMarkdownModal";

const { Text } = Typography;

export const CustomSlugForm = ({
  formId,
  formPubkey,
  relays,
  viewKey,
  showAccessWarning = false,
  onEditClick,
}: {
  formId: string;
  formPubkey: string;
  relays: string[];
  viewKey?: string;
  showAccessWarning?: boolean;
  onEditClick?: () => void;
}) => {
  const [slug, setSlug] = useState(formId);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  
  const navigate = useNavigate();
  const { generateAuthHeader, error: authError } = useNostrAuth();
  const { pubkey } = useProfileContext();

  const checkAvailability = async () => {
    if (!slug) return;
    setChecking(true);
    setAvailable(null);
    setError(null);
    try {
      const formPath = `/api/forms/${slug}`;
      const apiURl = `${appConfig.apiBaseUrl}${formPath}`;
      await axios.get(formPath, { withCredentials: false });
      setAvailable(false); // exists = taken
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAvailable(true); // not found = available
      } else {
        setError(err.response?.data?.error.replace('hyphens, and', 'hyphens,<br>and') || "Server error");
      }
    } finally {
      setChecking(false);
    }
  };

  const handleZapSuccess = () => {
    navigate(`/i/${slug}`);
  };

  const handlePay = async () => {
    const payPath = `/api/generateInvoice`;
    const apiUrl = `${appConfig.apiBaseUrl}${payPath}`;
    try {
      const authHeader = await generateAuthHeader(apiUrl, "POST", {
        slug: slug,
        formId: formId,
        formPubkey,
        relays,
        viewKey,
      });
      const res = await axios.post(
        apiUrl,
        { slug, formId, formPubkey, relays, viewKey },
        {
          headers: { Authorization: authHeader },
        }
      );
      console.log("APIR RESULT", res);
      const { invoice, paymentHash } = res.data;
      const { amount } = res.data;
      setAmount(amount);
      setInvoice(invoice);
      setHash(paymentHash);
      setSlug(slug);
    } catch (err: any) {
      setError(err.response?.data?.error || `Payment error: ${err}`);
    }
  };

  const isLoggedIn = !!pubkey;

  return (
    <div style={{ marginTop: 32, maxWidth: 400 }}>
      <Divider />
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {!isLoggedIn && (
          <Alert
            message="You must be logged in with Nostr to claim a custom URL."
            type="warning"
            showIcon
          />
        )}

        <Input
          placeholder="your-custom-slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value.trim());
            setAvailable(null); // reset availability
          }}
          onPressEnter={checkAvailability}
          addonBefore="/i/"
          suffix={
            checking ? (
              <LoadingOutlined />
            ) : available ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : null
          }
          disabled={!isLoggedIn}
        />
        <Row gutter={8}>
          <Col>
            <Button onClick={checkAvailability} disabled={!slug || !isLoggedIn}>
              Check Availability
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={handlePay}
              disabled={!available || !isLoggedIn}
            >
              Pay to Claim
            </Button>
          </Col>
        </Row>

        {/* Terms and Privacy line aligned cleanly below the buttons */}
        <Text type="secondary" style={{ fontSize: 12 }}>
          By continuing, you agree to our{" "}
          <a
            onClick={() => setShowTermsModal(true)}
            style={{ textDecoration: "underline" }}
          >
            Terms of Service and Privacy Policy
          </a>
          .
        </Text>

        {error && <Alert type="error" message={error} />}
        {/* Show yellow alert below check/pay buttons if showAccessWarning is true */}
        {showAccessWarning && (
          <Alert
            message={
              <>
                Anyone with this URL can access your form. If you 
                <br />
                proceed, your form can be accessed Formstr Inc.
                {onEditClick && (
                  <Button
                    type="link"
                    style={{ marginLeft: 8, padding: 0 }}
                    onClick={onEditClick}
                  >
                    Edit
                  </Button>
                )}
              </>
            }
            type="warning"
            showIcon
          />
        )}
      </Space>
      <ZapQRCodeModal
        open={!!invoice}
        invoice={invoice!}
        hash={hash!}
        amount={amount!}
        onSuccess={handleZapSuccess}
        onClose={() => setInvoice(null)}
      />
      <UniversalMarkdownModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Privacy"
        filePath="/docs/TermsOfUse.md"
      />
    </div>
  );
};
