import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import './App.css'
import './Chart.css'
import { BrowserRouter } from "react-router-dom";
import { store } from "./states/store.js";
import { Provider } from "react-redux";
import { StyledEngineProvider } from '@mui/material/styles';

// import './index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <App />
        </StyledEngineProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
