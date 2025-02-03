import React, { useState } from 'react';
import './BB8Toggle.css';
import { useTheme } from '../../../../provider/ThemeProvider';

interface BB8ToggleProps {
  onChange?: (checked: boolean) => void;
}

export const BB8Toggle: React.FC<BB8ToggleProps> = ({ onChange }) => {
  const { isDark, toggleTheme } = useTheme();

  
  return (
    <label className="bb8-toggle">
      <input 
        className="bb8-toggle__checkbox" 
        type="checkbox"
        checked={isDark}
        onChange={(e) => toggleTheme(e.target.checked)}
      />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bb8-toggle__star" />
          ))}
          <div className="tatto-1" />
          <div className="tatto-2" />
          <div className="gomrassen" />
          <div className="hermes" />
          <div className="chenini" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bb8-toggle__cloud" />
          ))}
        </div>
        <div className="bb8">
          <div className="bb8__head-container">
            <div className="bb8__antenna" />
            <div className="bb8__antenna" />
            <div className="bb8__head" />
          </div>
          <div className="bb8__body" />
        </div>
        <div className="artificial__hidden">
          <div className="bb8__shadow" />
        </div>
      </div>
    </label>
  );
};

export default BB8Toggle;