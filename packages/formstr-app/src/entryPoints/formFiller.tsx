import ReactDOM from "react-dom/client";
import React from "react";
import { ConfigProvider } from "antd";
import { FormFiller } from "../containers/FormFillerNew";
import { ApplicationProvider } from "../provider/ApplicationProvider";
import { ProfileProvider } from "../provider/ProfileProvider";
import { HashRouter } from "react-router-dom";
let numTries = 0;
const tryAndRender = () => {
  numTries += 1;
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    return false;
  }
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "Anek Devanagari, ui-serif, Inter, ui-sans-serif",
            colorPrimary: "#FF5733",
            colorLink: "#FF5733",
          },
        }}
      >
        <HashRouter>
          <ApplicationProvider>
            <ProfileProvider>
              <FormFiller />
            </ProfileProvider>
          </ApplicationProvider>
        </HashRouter>
      </ConfigProvider>
    </React.StrictMode>,
  );
  return true;
};

const renderFiller = () => {
  window.requestIdleCallback(() => {
    const hasRendered = tryAndRender();
    if (!hasRendered && numTries <= 3) {
      // renderFiller();
    }
  });
};

renderFiller();
