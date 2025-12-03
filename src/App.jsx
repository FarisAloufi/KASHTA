import React from "react";
import { Routes, Route } from "react-router-dom";

// --- Layout Components ---
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// --- Auth Guards ---
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProviderRoute from "./components/auth/ProviderRoute";

// --- Pages: Public ---
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutUsPage from "./pages/AboutUsPage";
import CartPage from "./pages/CartPage";

// --- Pages: Authentication ---
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProviderRegisterPage from "./pages/provider/ProviderRegisterPage";

// --- Pages: User (Protected) ---
import ProfilePage from "./pages/ProfilePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import BookingDetailPage from "./pages/BookingDetailPage";

// --- Pages: Provider & Admin ---
import AddServicePage from "./pages/provider/AddServicePage";
import ManageBookingsPage from "./pages/provider/ManageBookingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    // Flex container to ensure the Footer stays at the bottom
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Content Area: Grows to fill available space */}
      <main className="flex-grow">
        <Routes>

          {/* 1. Public Routes (Accessible by everyone) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* 2. Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/provider-apply" element={<ProviderRegisterPage />} />

          {/* 3. Protected Routes (Logged-in Users) */}
          {/* Wraps child routes to check if a user is authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/booking/:id" element={<BookingDetailPage />} />
          </Route>

          {/* 4. Provider & Admin Routes */}
          {/* Restricts access to Providers and Admins only */}
          <Route element={<ProviderRoute />}>
            <Route path="/add-service" element={<AddServicePage />} />
            <Route path="/manage-bookings" element={<ManageBookingsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;