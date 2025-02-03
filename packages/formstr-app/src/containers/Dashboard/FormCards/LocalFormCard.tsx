import { Button, Card, Typography } from "antd";
import { ILocalForm } from "../../CreateFormNew/providers/FormBuilder/typeDefs";
import { useNavigate } from "react-router-dom";
import DeleteFormTrigger from "./DeleteForm";
import { naddrUrl } from "../../../utils/utility";

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
    ? `/s/${form.privateKey}/${form.formId}`
    : `/response/${form.privateKey}`;
  if (form.relay) responseUrl = responseUrl + `?relay=${form.relay}`;
  let formUrl =
    form.publicKey && form.formId
      ? naddrUrl(form.publicKey, form.formId, [form.relay], form.viewKey)
      : `/fill/${form.publicKey}`;
  return (
    <Card
      title={form.name}
      className="form-card"
      extra={<DeleteFormTrigger formKey={form.key} onDeleted={onDeleted} />}
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
