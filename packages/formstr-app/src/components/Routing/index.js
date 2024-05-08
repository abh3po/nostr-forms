import { Routes, Route, Navigate } from "react-router-dom";
import MyForms from "../../containers/MyForms";
import PublicForms from "../../containers/PublicForms";
import { ROUTES } from "../../constants/routes";
import { FormFiller } from "../../containers/FormFiller";
import { NostrHeader } from "../Header";
import { CreateFormHeader } from "../../containers/CreateFormOld/components/Header/Header";
import FormBuilderProvider from "../../containers/CreateFormOld/providers/FormBuilder";
import { Responses } from "../../containers/Responses/Responses";
import { V1DraftsController } from "../../containers/Drafts";
import CreateFormOld from "../../containers/CreateFormOld";
import CreateForm from "../../containers/CreateForm";

const withNostrHeaderWrapper = (Component, props) => {
  return (
    <>
      <NostrHeader selected="Create Form" />
      <Component {...props} />
    </>
  );
};
const withCreateFormHeaderWrapper = (Component, props) => {
  return (
    <>
      <FormBuilderProvider>
        <CreateFormHeader />
        <Component {...props} />
      </FormBuilderProvider>
    </>
  );
};

function Routing() {
  return (
    <Routes>
      <Route path="forms/:formId" element={<FormFiller />} />
      <Route
        path="forms/:formSecret/responses"
        element={withNostrHeaderWrapper(Responses)}
      />
      <Route index element={<Navigate replace to={ROUTES.MY_FORMS} />} />
      <Route
        path={`${ROUTES.CREATE_FORMS}/*`}
        element={withCreateFormHeaderWrapper(CreateFormOld)}
      />
      <Route
        path={`${ROUTES.CREATE_FORMS_NEW}/*`}
        element={withCreateFormHeaderWrapper(CreateForm)}
      />
      <Route
        path={`${ROUTES.MY_FORMS}/*`}
        element={withNostrHeaderWrapper(MyForms)}
      />
      <Route
        path={`${ROUTES.PUBLIC_FORMS}/*`}
        element={withNostrHeaderWrapper(PublicForms)}
      />
      <Route path={`${ROUTES.FORM_FILLER}/*`} element={<FormFiller />} />
      <Route
        path={`${ROUTES.EMBEDDED}/*`}
        element={<FormFiller embedded={true} />}
      />
      <Route
        path={`${ROUTES.RESPONSES}/*`}
        element={withNostrHeaderWrapper(Responses)}
      />
      <Route
        path={`${ROUTES.DRAFT}/*`}
        element={withNostrHeaderWrapper(V1DraftsController)}
      />
      <Route path={`${ROUTES.FORM_FILLER_NEW}/*`} element={<FormFiller />} />
    </Routes>
  );
}

export default Routing;
