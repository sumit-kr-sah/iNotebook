import { useState, useEffect } from "react";
import ThemeContext from "./themeContext";

const ThemeState = (props) => {
  // Check if a theme preference is stored in localStorage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme());

  // Effect to apply theme when it changes
  useEffect(() => {
    // Apply theme to document body
    document.body.setAttribute("data-theme", theme);
    
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
    
    // Update CSS variables based on theme
    if (theme === "dark") {
      document.documentElement.style.setProperty('--primary-rgb', '82, 113, 255');
      document.documentElement.style.setProperty('--dark-color', '#f8f9fa');
      document.documentElement.style.setProperty('--light-color', '#2a2d43');
      document.documentElement.style.setProperty('--body-bg', '#1a1d2e');
      document.documentElement.style.setProperty('--card-bg', '#2a2d43');
      document.documentElement.style.setProperty('--text-color', '#e4e6eb');
      document.documentElement.style.setProperty('--muted-color', '#b0b3b8');
      document.documentElement.style.setProperty('--border-color', '#3e4154');
    } else {
      document.documentElement.style.setProperty('--primary-rgb', '82, 113, 255');
      document.documentElement.style.setProperty('--dark-color', '#2a2d43');
      document.documentElement.style.setProperty('--light-color', '#f8f9fa');
      document.documentElement.style.setProperty('--body-bg', '#f5f7fb');
      document.documentElement.style.setProperty('--card-bg', '#ffffff');
      document.documentElement.style.setProperty('--text-color', '#2a2d43');
      document.documentElement.style.setProperty('--muted-color', '#6c757d');
      document.documentElement.style.setProperty('--border-color', '#f0f0f0');
    }
  }, [theme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeState; 