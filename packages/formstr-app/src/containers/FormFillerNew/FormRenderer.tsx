import { Form, Typography } from "antd";
import Markdown from "react-markdown";
import { FormFields } from "./FormFields";
import { Field, Tag } from "../../nostr/types";
import FillerStyle from "./formFiller.style";
import FormBanner from "../../components/FormBanner";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { Link } from "react-router-dom";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";

const { Text } = Typography;

interface FormRendererProps {
  formTemplate: Tag[];
  form: any;
  onInput: (questionId: string, answer: string, message?: string) => void;
  footer?: React.ReactNode;
  hideTitleImage?: boolean;
  hideDescription?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formTemplate,
  form,
  onInput,
  footer,
  hideTitleImage,
  hideDescription,
}) => {
  const name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
  const settings = JSON.parse(
    formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}",
  ) as IFormSettings;
  const fields = formTemplate.filter((tag) => tag[0] === "field") as Field[];

  return (
    <FillerStyle>
      <div className="filler-container">
        <div className="form-filler">
          {hideTitleImage ? (
            <FormBanner
              imageUrl={settings?.titleImageUrl || ""}
              formTitle={name}
            />
          ) : null}
          {hideDescription ? (
            <div className="form-description">
              <Text>
                <Markdown>{settings?.description}</Markdown>
              </Text>
            </div>
          ) : null}
          <Form form={form} onFinish={() => {}} className="with-description">
            <FormFields fields={fields} handleInput={onInput} />
            {footer}
          </Form>
        </div>

        <div className="branding-container">
          <Link to="/">
            <CreatedUsingFormstr />
          </Link>
          {!isMobile() && (
            <a
              href="https://github.com/abhay-raizada/nostr-forms"
              className="foss-link"
            >
              <Text className="text-style">
                Formstr is free and Open Source
              </Text>
            </a>
          )}
        </div>
      </div>
    </FillerStyle>
  );
};
