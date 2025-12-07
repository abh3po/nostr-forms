import { BrowserRouter } from "react-router-dom";
import "./App.css";
import React from "react";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { TemplateProvider } from "./provider/TemplateProvider";
import { initPoolAuth } from "./pool";

function App() {
  React.useEffect(() => {
    initPoolAuth(); // async init, safe if signer fails
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <ApplicationProvider>
          <ProfileProvider>
            <TemplateProvider>
              <Routing />
            </TemplateProvider>
          </ProfileProvider>
        </ApplicationProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
