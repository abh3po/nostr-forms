import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Anek Devanagari, ui-serif, Inter, ui-sans-serif',
          colorPrimary: '#FF5733',
          colorLink: '#FF5733',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
