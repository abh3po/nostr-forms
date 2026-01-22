import { UrlBox } from "./UrlBox";
import { ReactComponent as Success } from "../../../../Images/success.svg";

export const ShareTab = ({
  formUrl,
  responsesUrl,
}: {
  formUrl: string;
  responsesUrl?: string;
}) => {
  return (
    <div className="share-links" style={{ textAlign: "center" }}>
      <Success />

      <div style={{ marginTop: 12 }}>
        <UrlBox label="Live Form URL" url={formUrl} />

        {responsesUrl && (
          <>
            <UrlBox
              label="Responses URL"
              url={responsesUrl}
              warning="Anyone with this link can view responses to this form. Share it carefully."
            />
          </>
        )}
      </div>
    </div>
  );
};
