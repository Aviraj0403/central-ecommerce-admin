// ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Define the context
const ThemeContext = createContext();

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Get the saved theme from localStorage or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    }
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDark((prevState) => {
      const newTheme = !prevState;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);
