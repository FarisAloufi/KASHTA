import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// --- Global Styles ---
import "./index.css";

// --- Context Providers ---
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext"; // <--- 1. تم إضافة هذا الاستيراد

// --- Main Application Component ---
import App from "./App.jsx";
import './i18n';

// --- Application Entry Point ---

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Provider Hierarchy:
        1. BrowserRouter: Enables routing.
        2. AuthProvider: Auth state.
        3. CartProvider: Cart state.
        4. ThemeProvider: Dark/Light Mode state. (NEW)
        5. App: Root component.
    */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);