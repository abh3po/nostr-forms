import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useFormBuilderContext from "../../../hooks/useFormBuilderContext";
import { useSnackbar } from "../../../../../providers/SnackbarProvider";
import { isLud16ZapCapable } from "../../../../../nostr/zap";

type Lud16Status = "idle" | "checking" | "ok" | "invalid";

export default function Payments() {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const { formSettings, updateFormSetting } = useFormBuilderContext();
  const [lud16Status, setLud16Status] = useState<Lud16Status>("idle");

  const lud16 = formSettings.paymentLud16 ?? "";
  const amount = formSettings.paymentAmountSats ?? 0;
  const contact = formSettings.contact ?? "";

  // Re-validate the lud16 on change; keep the stored value even while checking.
  const validateLud16 = async (value: string) => {
    const v = value.trim();
    updateFormSetting({ paymentLud16: v });
    if (!v) {
      setLud16Status("idle");
      return;
    }
    setLud16Status("checking");
    const ok = await isLud16ZapCapable(v);
    setLud16Status(ok ? "ok" : "invalid");
  };

  const tryEnable = async (checked: boolean) => {
    if (!checked) {
      updateFormSetting({ collectsPayments: false });
      return;
    }
    // App-level enforcement (the protocol cannot enforce these).
    if (!contact.trim()) {
      showMessage(t("builder.formSettings.payments.contactRequired"), "warning");
      return;
    }
    if (!lud16.trim()) {
      showMessage(t("builder.formSettings.payments.lud16Required"), "warning");
      return;
    }
    if (!amount || amount <= 0) {
      showMessage(t("builder.formSettings.payments.amountRequired"), "warning");
      return;
    }
    // Confirm the lud16 is still zap-capable before flipping the switch on.
    if (lud16Status !== "ok") {
      setLud16Status("checking");
      const ok = await isLud16ZapCapable(lud16);
      setLud16Status(ok ? "ok" : "invalid");
      if (!ok) {
        showMessage(t("builder.formSettings.payments.lud16Invalid"), "warning");
        return;
      }
    }
    updateFormSetting({ collectsPayments: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        alignItems: "stretch",
        my: 1.5,
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 14 }}>
          {t("builder.formSettings.payments.collectsPayments")}
        </Typography>
        <Switch
          checked={!!formSettings.collectsPayments}
          onChange={(_e, c) => tryEnable(c)}
        />
      </Box>
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        {t("builder.formSettings.payments.collectsPaymentsHint")}
      </Typography>

      <Typography sx={{ fontSize: 14, mt: 1 }}>
        {t("builder.formSettings.payments.lud16")}
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder={t("builder.formSettings.payments.lud16Placeholder")}
        value={lud16}
        onChange={(e) => validateLud16(e.target.value)}
        error={lud16Status === "invalid"}
        slotProps={{
          input: {
            endAdornment:
              lud16Status === "checking" ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : null,
          },
        }}
      />
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        {t("builder.formSettings.payments.lud16Hint")}
      </Typography>
      {lud16Status === "ok" && (
        <Alert severity="success" sx={{ py: 0.5 }}>
          {t("builder.formSettings.payments.lud16Ok")}
        </Alert>
      )}
      {lud16Status === "invalid" && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {t("builder.formSettings.payments.lud16Invalid")}
        </Alert>
      )}

      <Typography sx={{ fontSize: 14, mt: 1 }}>
        {t("builder.formSettings.payments.amountSats")}
      </Typography>
      <TextField
        size="small"
        type="number"
        fullWidth
        value={amount || ""}
        onChange={(e) =>
          updateFormSetting({
            paymentAmountSats: Math.max(0, Math.floor(Number(e.target.value) || 0)),
          })
        }
        slotProps={{ htmlInput: { min: 1, step: 1 } }}
      />
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        {t("builder.formSettings.payments.amountSatsHint")}
      </Typography>

      <Typography sx={{ fontSize: 14, mt: 1 }}>
        {t("builder.formSettings.payments.contact")}
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder={t("builder.formSettings.payments.contactPlaceholder")}
        value={contact}
        onChange={(e) => updateFormSetting({ contact: e.target.value.trim() })}
      />
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        {t("builder.formSettings.payments.contactHint")}
      </Typography>
    </Box>
  );
}