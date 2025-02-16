import { Button, Card, Typography } from "antd";
import { ILocalForm } from "../../CreateFormNew/providers/FormBuilder/typeDefs";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";
import { editPath, responsePath } from "../../../utils/formUtils";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";

interface LocalFormCardProps {
  form: ILocalForm;
  onDeleted: () => void;
}

const { Text } = Typography;
export const LocalFormCard: React.FC<LocalFormCardProps> = ({
  form,
  onDeleted,
}) => {
  const navigate = useNavigate();
  let responseUrl = form.formId
    ? responsePath(form.privateKey, form.formId, form.relay, form.viewKey)
    : `/response/${form.privateKey}`;
  let formUrl =
    form.publicKey && form.formId
      ? naddrUrl(form.publicKey, form.formId, [form.relay], form.viewKey)
      : `/fill/${form.publicKey}`;
  return (
    <Card
      title={form.name}
      className="form-card"
      extra={
        <div>
          <EditOutlined
            style={{ color: "purple", marginBottom: 3 }}
            onClick={() =>
              navigate(
                editPath(form.privateKey, form.formId, form.relay, form.viewKey)
              )
            }
          />
          <DeleteFormTrigger formKey={form.key} onDeleted={onDeleted} />
        </div>
      }
    >
      <Button
        onClick={(e) => {
          navigate(responseUrl);
        }}
      >
        View Responses
      </Button>
      <Button
        onClick={(e: any) => {
          e.stopPropagation();
          navigate(formUrl);
        }}
        style={{
          marginLeft: "10px",
        }}
      >
        Open Form
      </Button>
    </Card>
  );
};
