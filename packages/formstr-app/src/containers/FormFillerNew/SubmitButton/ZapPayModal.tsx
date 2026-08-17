import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { subscribeZapReceipts } from "../../../nostr/zap";
import { CopyButton } from "../../../components/CopyButton";

export interface ZapPayModalProps {
  open: boolean;
  bolt11: string;
  hash: string;
  amountMsats: number;
  /** Author's Lightning address being paid. */
  lud16: string;
  contact?: string;
  // 9735-receipt detection parameters:
  formACoord: string;
  responseId: string;
  authorPubkey: string;
  requiredMsats: number;
  relays: string[];
  onPaid: () => void;
  onCancel: () => void;
}

export const ZapPayModal: React.FC<ZapPayModalProps> = ({
  open,
  bolt11,
  hash,
  amountMsats,
  lud16,
  contact,
  formACoord,
  responseId,
  authorPubkey,
  requiredMsats,
  relays,
  onPaid,
  onCancel,
}) => {
  const { t } = useTranslation();

  // Watch for the matching kind-9735 zap receipt. The provider publishes it to
  // the relays we listed in the zap request, so a subscription there detects the
  // payment as soon as it settles.
  useEffect(() => {
    if (!open) return;
    const sub = subscribeZapReceipts({
      formACoord,
      responseId,
      authorPubkey,
      requiredMsats,
      relays,
      onReceipt: () => onPaid(),
    });
    return () => sub.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, responseId]);

  const openInWallet = () => {
    if (typeof window !== "undefined") {
      window.location.href = `lightning:${bolt11}`;
    }
  };

  return (
    <Dialog open={open} onClose={(_, reason) => {
      if (reason !== "backdropClick") onCancel();
    }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 1 }}>
        {t("filler.submit.pay.awaitingPayment")}
        <IconButton onClick={onCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", pb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
          <QRCodeSVG value={bolt11} size={200} includeMargin />
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
          {t("filler.submit.pay.payButton", { amount: amountMsats / 1000 })}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
          {t("filler.submit.pay.recipient")}: {lud16}
        </Typography>

        <Alert severity="info" sx={{ my: 2, textAlign: "left", fontSize: 12 }}>
          {t("filler.submit.pay.disclaimer")}
        </Alert>

        {contact && (
          <Typography color="text.secondary" sx={{ fontSize: 12, mb: 1, textAlign: "left" }}>
            {t("filler.submit.pay.contactForIssues")} {contact}
          </Typography>
        )}

        {hash && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
              mb: 2,
            }}
          >
            <Box sx={{ textAlign: "left", overflow: "hidden" }}>
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                {t("filler.submit.pay.paymentHash")}
              </Typography>
              <Typography sx={{ fontSize: 11, wordBreak: "break-all" }}>
                {hash.length > 32 ? `${hash.slice(0, 16)}…${hash.slice(-12)}` : hash}
              </Typography>
            </Box>
            <CopyButton getText={() => hash} />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            {t("filler.submit.pay.awaitingPayment")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Button variant="outlined" onClick={openInWallet}>
            {t("filler.submit.pay.openWallet")}
          </Button>
          <Button variant="text" color="error" onClick={onCancel}>
            {t("filler.submit.pay.cancelPayment")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};