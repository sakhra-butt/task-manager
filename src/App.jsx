// Core/Library
import React from "react";
import { Provider } from "react-redux";

// Local
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import store from "./store";
import { useAutoLogout } from "./utils/useAutoLogout";

// Styles
import "./styles/App.scss";

const App = () => {
  useAutoLogout();
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
