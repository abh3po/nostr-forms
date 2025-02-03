import { HashRouter } from "react-router-dom";
import "./App.css";
import Routing from "./components/Routing";
import { ProfileProvider } from "./provider/ProfileProvider";
import { ApplicationProvider } from "./provider/ApplicationProvider";
import { ThemeProvider, useTheme } from "./provider/ThemeProvider";
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const lightTheme = {
  background: '#fff',
  text: '#000',
  border: '#dedede'
};

const darkTheme = {
  background: '#1f1f1f', 
  text: '#fff',
  border: '#434343'
};

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <StyledThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <ProfileProvider>
        <ApplicationProvider>
          <Routing />
        </ApplicationProvider>
      </ProfileProvider>
    </StyledThemeProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="App">
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </div>
    </HashRouter>
  );
}