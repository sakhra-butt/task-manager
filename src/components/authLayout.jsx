import React from "react";
import logo from "../assets/note.svg";
// import Switch from "react-switch"; // Commented out - not needed when theme toggle is disabled
import { useTheme } from "../context/ThemeContext";

const authLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  // Commented out background image logic
  // const backgroundImage =
  //   theme === "dark" ? 'url("/dark-shape.svg")' : 'url("/light-shape.svg")';

  return (
    <div
      className={`auth-layout ${theme}-theme`}
      style={{
        minHeight: "100vh",
        // Commented out background styling
        // backgroundImage,
        // backgroundRepeat: "no-repeat",
        // backgroundPosition: "center center",
        // backgroundAttachment: "scroll",
        // backgroundSize: "cover",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Commented out Theme Toggle */}
      {/* 
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
        <label style={{ marginRight: 8 }}>
          {theme === "dark" ? "Dark" : "Light"}
        </label>
        <Switch onChange={toggleTheme} checked={theme === "dark"} />
      </div>
      */}

      {/* Logo */}
      <div style={{ position: "fixed", top: 20, left: 20, zIndex: 1000 }}>
        <img src={logo} alt="Logo" style={{ height: 60 }} />
      </div>

      {/* Page Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          paddingBottom: 16,
          fontSize: "0.85rem",
          color: theme === "dark" ? "#aaa" : "#555",
          opacity: 0.7,
        }}
      >
        © 2025 Task Manager. All rights reserved.
      </div>
    </div>
  );
};

export default authLayout;
