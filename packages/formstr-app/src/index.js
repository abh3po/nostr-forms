import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App"; 
import { ConfigProvider, App as AntdApp } from "antd";

const root = ReactDOM.createRoot(document.getElementById("root"));

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
      <AntdApp>
        <App /> 
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);