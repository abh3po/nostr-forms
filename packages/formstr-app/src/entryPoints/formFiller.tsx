import React from "react";
import { FormFiller } from "../containers/FormFillerNew";
import { renderReactComponent } from "./renderHelper";

const Component = () => {
  const _viewKey = window.__FORMSTR__FORM_IDENTIFIER__?.viewKey;
  const _naddr = window.__FORMSTR__FORM_IDENTIFIER__?.naddr;
  const naddr = _naddr !== "@naddr" ? _naddr : undefined;
  const viewKey = _viewKey !== "@viewKey" ? _viewKey : undefined;
  return <FormFiller naddr={naddr} viewKey={viewKey} />;
};

renderReactComponent({ Component });
