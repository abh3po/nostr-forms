import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";

function App() {
  // to maintain backward compatibility with older urls, we copy the hash to pathname and rerender the application
  // the search was coming as part of the pathname, so needed to split the search part
  if (window.location.hash) {
    const hashValue = window.location.hash.replace("#", "");
    const [route, search] = hashValue.split("?");
    window.location.pathname = route;
    window.location.search = search;
    window.location.hash = "";
  }
  return (
    <BrowserRouter>
      <div className="App">
        <ApplicationProvider>
          <ProfileProvider>
            <Routing />
          </ProfileProvider>
        </ApplicationProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;
