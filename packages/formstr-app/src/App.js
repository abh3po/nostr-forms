import { HashRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { ListProvider } from "./provider/ListProvider";

function App() {
  return (
    <HashRouter>
      <div className="App">
        <ProfileProvider>
          <ApplicationProvider>
            <ListProvider>
              <Routing />
            </ListProvider>
          </ApplicationProvider>
        </ProfileProvider>
      </div>
    </HashRouter>
  );
}

export default App;
