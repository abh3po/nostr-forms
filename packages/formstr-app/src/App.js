import { HashRouter, useLocation } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { useEffect } from "react";

// Component to handle forced routing
const RouteForce = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.__FORCE_ROUTE__) {
      const targetPath = window.__FORCE_ROUTE__.replace(/^#/, "");
      const currentPath = location.pathname + location.search + location.hash;

      if (!currentPath.includes(targetPath)) {
        window.location.hash = `#${targetPath}`;
      }
    }
  }, [location]);

  return null;
};


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
        <RouteForce />
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
