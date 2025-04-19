import { Link, useNavigate } from "react-router-dom";
import { Typography, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ReactComponent as NoData } from "../../Images/no-forms.svg";
import StyleWrapper from "./style";
import { ROUTES } from "../../constants/routes";
import { act } from "react-dom/test-utils";
import { FormTemplate } from "../../templates";
import TemplateCard from "../TemplateCard";

const { Text } = Typography;

interface EmptyScreenProps {
  message?: string;
  action?: () => void;
  actionLabel?: string;
  templates?: FormTemplate[];
  onTemplateClick?: (template: FormTemplate) => void;
  onOpenGalleryClick?: () => void;
}

function EmptyScreen({ message, action, actionLabel, templates, onTemplateClick,onOpenGalleryClick }: EmptyScreenProps) {
  let navigate = useNavigate();
  console.log("message,", message, action, actionLabel);
  const showTemplates = templates && templates.length > 0 && onTemplateClick;

  return (
    <StyleWrapper>
      {showTemplates ? (
        <>
          <Typography.Title level={4} style={{ marginBottom: '20px', textAlign: 'center' }}>
            Start a new form
          </Typography.Title>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', marginBottom: '20px' }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={onTemplateClick}
              />
            ))}
          </div>
          {onOpenGalleryClick && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <Button
                type="link"
                onClick={onOpenGalleryClick}
              >
                View Full Template Gallery
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <NoData className="empty-screen" />
          <Text className="no-data">
            {message || "Get started by creating your first form!"}
          </Text>
          <Button
            className="add-form"
            type="primary"
            icon={action ? null : <PlusOutlined style={{ paddingTop: "2px" }} />}
            onClick={() => {
              if (action) action();
              else {
                navigate(ROUTES.CREATE_FORMS_NEW);
              }
            }}
          >
            {actionLabel || "Create Form"}
          </Button>
        </>
      )}
    </StyleWrapper>
  );
}

export default EmptyScreen;
