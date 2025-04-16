import React, { useState, useEffect } from "react";
import { CountryDropdown } from "react-country-region-selector";

interface CountryFillerProps {
  onChange: (value: string) => void;
  defaultValue?: string;
}

export const CountryFiller: React.FC<CountryFillerProps> = ({
  onChange,
  defaultValue,
}) => {
  // Use internal state to track the selected country
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultValue || "");

  // This effect ensures the component updates if defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setSelectedCountry(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (country: string) => {
    console.log("selected country:", country);
    // Update internal state
    setSelectedCountry(country);
    // Pass to parent
    onChange(country);
  };

  return (
    <>
      <CountryDropdown
        value={selectedCountry}
        onChange={handleChange}
        defaultOptionLabel="Select your country"
        style={{ width: "30%", height: "30px" }}
      />
    </>
  );
};