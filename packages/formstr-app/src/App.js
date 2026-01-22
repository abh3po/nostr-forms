import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { TemplateProvider } from "./provider/TemplateProvider";
import { MyFormsProvider } from "./provider/MyFormsProvider";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ApplicationProvider>
          <ProfileProvider>
            <MyFormsProvider>
              <TemplateProvider>
                <Routing />
              </TemplateProvider>
            </MyFormsProvider>
          </ProfileProvider>
        </ApplicationProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
