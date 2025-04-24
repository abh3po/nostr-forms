import { BrowserRouter } from 'react-router-dom';

import './App.css';
import { HandleLegacyRoutes } from './components/HandleLegacyRoutes';
import Routing from './components/Routing';
import { ApplicationProvider } from './provider/ApplicationProvider';
import { ProfileProvider } from './provider/ProfileProvider';

function App() {
  return (
    <BrowserRouter>
      <HandleLegacyRoutes>
        <div className="App">
          <ApplicationProvider>
            <ProfileProvider>
              <Routing />
            </ProfileProvider>
          </ApplicationProvider>
        </div>
      </HandleLegacyRoutes>
    </BrowserRouter>
  );
}

export default App;
