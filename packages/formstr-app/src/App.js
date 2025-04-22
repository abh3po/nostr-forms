import { HashRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";

function App() {
  return (
    <HashRouter>
      <div className="App">
        <ApplicationProvider>
          <ProfileProvider>
            <Routing />
          </ProfileProvider>
        </ApplicationProvider>
      </div>
    </HashRouter>
  );
}

export default App;
