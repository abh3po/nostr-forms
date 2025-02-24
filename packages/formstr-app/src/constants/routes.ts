import { Dashboard } from "../containers/Dashboard";

export const ROUTES = {
  CREATE_FORMS_NEW: "/c",
  DASHBOARD: "/dashboard",
  PUBLIC_FORMS: "/public",
  FORM_FILLER: "/fill/:formId",
  FORM_FILLER_OLD: "/forms/:formId",
  FORM_FILLER_NEW: "/f/:naddr",
  EDIT_FORM_SECRET: "edit/:formSecret/:formId",
  PREVIEW: "/preview",
  RESPONSES: "/response/:formSecret",
  RESPONSES_NEW: "/r/:pubKey/:formId",
  RESPONSES_SECRET: "/s/:secretKey/:formId",
  DRAFT: "/drafts/:encodedForm",
  EMBEDDED: "/embedded/:formId",
};
