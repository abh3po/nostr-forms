import { Routes, Route, Navigate } from "react-router-dom";
import PublicForms from "../../containers/PublicForms";
import { ROUTES } from "../../constants/routes";
import { FormFillerOld } from "../../old/containers/FormFiller";
import { FormFiller } from "../../containers/FormFillerNew";
import { NostrHeader } from "../Header";
import { CreateFormHeader as CreateFormHeaderNew } from "../../containers/CreateFormNew/components/Header/Header";
import NewFormBuilderProvider from "../../containers/CreateFormNew/providers/FormBuilder";
import { ResponsesOld } from "../../old/containers/Responses/Responses";
import { Response } from "../../containers/ResponsesNew";
import { V1DraftsController } from "../../containers/Drafts";
import CreateForm from "../../containers/CreateFormNew";
import { Dashboard } from "../../containers/Dashboard";
import EditForm from "../../containers/EditForm";

const withNostrHeaderWrapper = (Component, props) => {
  return (
    <>
      <NostrHeader selected="Create Form" />
      <Component {...props} />
    </>
  );
};

const withNewCreateFormHeaderWrapper = (Component, props) => {
  return (
    <>
      <NewFormBuilderProvider>
        <CreateFormHeaderNew />
        <Component {...props} />
      </NewFormBuilderProvider>
    </>
  );
};

function Routing() {
  return (
    <Routes>
      <Route
        path="forms/:formSecret/responses"
        element={withNostrHeaderWrapper(ResponsesOld)}
      />
      <Route index element={<Navigate replace to={ROUTES.DASHBOARD} />} />
      <Route
        path={`${ROUTES.CREATE_FORMS_NEW}/*`}
        element={withNewCreateFormHeaderWrapper(CreateForm)}
      />
       <Route
        path={`${ROUTES.EDIT_FORM_SECRET}/*`}
        element={withNewCreateFormHeaderWrapper(EditForm)}
      />
      <Route
        path={`${ROUTES.PUBLIC_FORMS}/*`}
        element={withNostrHeaderWrapper(PublicForms)}
      />
      <Route path={`${ROUTES.FORM_FILLER}/*`} element={<FormFillerOld />} />
      <Route path={`${ROUTES.FORM_FILLER_OLD}/*`} element={<FormFillerOld />} />
      <Route
        path={`${ROUTES.EMBEDDED}/*`}
        element={<FormFillerOld embedded={true} />}
      />
      <Route
        path={`${ROUTES.RESPONSES}/*`}
        element={withNostrHeaderWrapper(ResponsesOld)}
      />
      <Route
        path={`${ROUTES.RESPONSES_NEW}/*`}
        element={withNostrHeaderWrapper(Response)}
      />
      <Route
        path={`${ROUTES.RESPONSES_SECRET}/*`}
        element={withNostrHeaderWrapper(Response)}
      />
      <Route
        path={`${ROUTES.DRAFT}/*`}
        element={withNostrHeaderWrapper(V1DraftsController)}
      />
      <Route path={`${ROUTES.FORM_FILLER_NEW}/*`} element={<FormFiller />} />
      <Route
        path={`${ROUTES.DASHBOARD}/:filterType?`}
        element={withNostrHeaderWrapper(Dashboard)}
      />
    </Routes>
  );
}

export default Routing;
