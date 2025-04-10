import { HashRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { UserProvider } from "./provider/UserProvider";
import { ListProvider } from "./provider/ListProvider";
import { AppContextProvider } from "./provider/AppProvider";

function App() {
  return (
    <HashRouter>
      <div className="App">
        <ProfileProvider>
          <ApplicationProvider>
            <AppContextProvider>
              <UserProvider>
                <ListProvider>
                  <Routing />
                </ListProvider>
              </UserProvider>
            </AppContextProvider>
          </ApplicationProvider>
        </ProfileProvider>
      </div>
    </HashRouter>
  );
}

export default App;
