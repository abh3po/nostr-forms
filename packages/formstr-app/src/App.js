import { HashRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";

// Force hash routing before app renders
const forceRoute = window.__FORCE_ROUTE__;
if (forceRoute) {
  const targetHash = "#" + forceRoute.replace(/^\//, "");
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}


function App() {
  return (
    <HashRouter>
      <div className="App">
        <ProfileProvider>
          <ApplicationProvider>
            <Routing />
          </ApplicationProvider>
        </ProfileProvider>
      </div>
    </HashRouter>
  );
}

export default App;
