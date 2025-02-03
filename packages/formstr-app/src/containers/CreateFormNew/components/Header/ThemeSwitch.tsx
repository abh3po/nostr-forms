import React, { useState } from "react";
import "./ThemeSwitch.css";
import { useTheme } from "../../../../provider/ThemeProvider";

interface ThemeSwitchProps {
  onChange?: (isDark: boolean) => void;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ onChange }) => {
  const { isDark, toggleTheme } = useTheme();
  const [checked, setChecked] = useState(false);

  return (
    <label className="theme-switch">
      <input 
        type="checkbox" 
        className="theme-switch__checkbox"
        checked={isDark}
        onChange={(e) => toggleTheme(e.target.checked)}
      />
      <div className="theme-switch__container">
        <div className="theme-switch__clouds"></div>
        <div className="theme-switch__stars-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 144 55"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
            </div>
          </div>
        </div>
      </div>
    </label>
  );
};

export default ThemeSwitch;
