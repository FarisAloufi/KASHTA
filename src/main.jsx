import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// --- Global Styles ---
import "./index.css";

// --- Context Providers ---
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// --- Main Application Component ---
import App from "./App.jsx";

// --- Application Entry Point ---

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Provider Hierarchy:
        1. BrowserRouter: Enables routing across the application.
        2. AuthProvider: Manages user authentication state (Login/Logout).
        3. CartProvider: Manages shopping cart state (Add/Remove items).
        4. App: The root component containing layouts and pages.
    */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);