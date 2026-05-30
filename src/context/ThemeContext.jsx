// context/ThemeContext.jsx
import { createContext, useState, useEffect } from "react";
import { THEMES } from "../data/themeData";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};