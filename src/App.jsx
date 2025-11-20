import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import AddServicePage from "./pages/provider/AddServicePage";
import ManageBookingsPage from "./pages/provider/ManageBookingsPage";
import ServicesPage from "./pages/ServicesPage";
import AboutUsPage from "./pages/AboutUsPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";

// Routes
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProviderRoute from "./components/auth/ProviderRoute";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />


          <Route element={<ProtectedRoute />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/booking/:id" element={<BookingDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProviderRoute />}>
            <Route path="/add-service" element={<AddServicePage />} />
            <Route path="/manage-bookings" element={<ManageBookingsPage />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
