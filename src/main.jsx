import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f766e",
          borderRadius: 8,
          fontFamily: "Manrope, sans-serif",
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>,
);
