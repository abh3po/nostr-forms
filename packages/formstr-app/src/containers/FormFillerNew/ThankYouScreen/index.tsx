import { Dialog, Box, Typography, Link } from "@mui/material";
import ThankYouStyle from "./thankyou.style";
import { Event } from "nostr-tools";
import { IFormSettings } from "../../CreateFormNew/components/FormSettings/types";
import { useState, useEffect } from "react";
import { getFormSpec } from "../../../utils/formUtils";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { useTranslation } from "react-i18next";
import { CopyButton } from "../../../components/CopyButton";

export const ThankYouScreen = ({
  formEvent,
  isOpen,
  onClose,
  viewKey,
  permalink,
}: {
  formEvent: Event;
  isOpen: boolean;
  onClose: () => void;
  viewKey: string | null;
  permalink?: string | null;
}) => {
  const { t } = useTranslation();
  const { pubkey: userPubKey } = useProfileContext();
  const [settings, setSettings] = useState<IFormSettings>();

  useEffect(() => {
    const initialize = async () => {
      if (formEvent.content === "") {
        const settingsTag = formEvent.tags.find((tag) => tag[0] === "settings");
        if (settingsTag) {
          const parsedSettings = JSON.parse(
            settingsTag[1] || "{}"
          ) as IFormSettings;
          setSettings(parsedSettings);
        }
        return;
      }

      const formSpec = await getFormSpec(
        formEvent,
        userPubKey,
        () => {},
        viewKey
      );
      if (formSpec) {
        const settings = JSON.parse(
          formSpec.find((tag) => tag[0] === "settings")?.[1] || "{}"
        ) as IFormSettings;
        setSettings(settings);
      }
    };
    initialize();
  }, []);
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <ThankYouStyle>
        <div
          className="thank-you-image-container"
          style={{ marginTop: "20px" }}
        >
          <img
            src={
              settings?.thankYouScreenImageUrl ||
              "https://image.nostr.build/ab238249194e61952d5d199f9595c88da1ba6b1e3d981232e9dc4821a19908fe.gif"
            }
            className="thank-you-image"
            alt="Thank you"
          />
        </div>
        {permalink && (
          <Box sx={{ p: 2, pt: 0, width: "100%" }}>
            <Typography sx={{ fontSize: 14, mb: 0.5 }}>
              {t("filler.submit.pay.permalink")}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12, mb: 1 }}>
              {t("filler.submit.pay.permalinkHint")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                wordBreak: "break-all",
              }}
            >
              <Link
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: 12, wordBreak: "break-all" }}
              >
                {permalink.length > 60
                  ? `${permalink.slice(0, 40)}…${permalink.slice(-16)}`
                  : permalink}
              </Link>
              <CopyButton getText={() => permalink} />
            </Box>
            <Typography color="text.secondary" sx={{ fontSize: 11, mt: 1 }}>
              {t("filler.submit.pay.permalinkEncryptedNote")}
            </Typography>
          </Box>
        )}
      </ThankYouStyle>
    </Dialog>
  );
};
