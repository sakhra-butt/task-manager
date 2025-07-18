import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import store from "./store";
import "./styles/App.scss";

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
