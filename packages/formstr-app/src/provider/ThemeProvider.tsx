import React, { createContext, useContext, useState } from 'react';

export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: (isDark: boolean) => {},
});

export const lightTheme = {
    background: '#fff',
    text: '#000',
    border: '#dedede'
  };
  
  export const darkTheme = {
    background: '#1f1f1f',
    text: '#fff',  
    border: '#434343'
  };

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);