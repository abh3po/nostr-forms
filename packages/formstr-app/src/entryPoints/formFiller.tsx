import React from "react";
import { FormFiller } from "../containers/FormFillerNew";
import { renderReactComponent } from "./renderHelper";
import { Event } from "nostr-tools";

const Component = () => {
  const _viewKey = window.__FORMSTR__FORM_IDENTIFIER__?.viewKey;
  const _naddr = window.__FORMSTR__FORM_IDENTIFIER__?.naddr;
  const _formContent = window.__FORMSTR__FORM_IDENTIFIER__?.formContent;
  const naddr = _naddr !== "@naddr" ? _naddr : undefined;
  const viewKey = _viewKey !== "@viewKey" ? _viewKey : undefined;
  const formContent =
    _formContent && _formContent !== "@formContent"
      ? (JSON.parse(_formContent) as Event)
      : undefined;
  return (
    <FormFiller
      naddr={naddr}
      viewKey={viewKey}
      preFetchedFormContent={formContent}
    />
  );
};

renderReactComponent({ Component });
