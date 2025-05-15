import React from "react";
import { FormFiller } from "../containers/FormFillerNew";
import { renderReactComponent } from "./renderHelper";

const Component = () => {
  const _viewKey = window.__FORMSTR__FORM_IDENTIFIER__?.viewKey;
  const _naddr = window.__FORMSTR__FORM_IDENTIFIER__?.naddr;
  const naddr = _naddr !== "@naddr" ? _naddr : undefined;
  return <FormFiller naddr={_naddr} viewKey={_viewKey} />;
};

renderReactComponent({ Component });
