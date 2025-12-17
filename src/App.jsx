import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Loader } from "lucide-react"; 
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// --- Contexts ---
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";

// --- Utils ---
import ScrollToTop from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";

// --- Layouts & Guards ---
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProviderRoute from "./components/auth/ProviderRoute";

// --- Lazy Loading Pages 🚀 ---

// Pages: Public
const HomePage = lazy(() => import("./pages/shared/HomePage"));
const ServicesPage = lazy(() => import("./pages/shared/ServicesPage"));
const ServiceDetailPage = lazy(() => import("./pages/shared/ServiceDetailPage"));
const AboutUsPage = lazy(() => import("./pages/shared/AboutUsPage"));
const CartPage = lazy(() => import("./pages/customer/CartPage"));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// Pages: Authentication
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ProviderRegisterPage = lazy(() => import("./pages/auth/ProviderRegisterPage"));

// Pages: User (Protected)
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));
const MyBookingsPage = lazy(() => import("./pages/customer/MyBookingsPage"));
const BookingDetailPage = lazy(() => import("./pages/customer/BookingDetailPage"));

// ✅ New Custom Request Pages
const CreateRequestPage = lazy(() => import("./pages/customer/CreateRequestPage"));
const MyCustomRequestsPage = lazy(() => import("./pages/customer/MyCustomRequestsPage"));
const RequestDetailsPage = lazy(() => import("./pages/customer/RequestDetailsPage"));

// Pages: Provider & Admin
const AddServicePage = lazy(() => import("./pages/provider/AddServicePage"));
const ManageBookingsPage = lazy(() => import("./pages/provider/ManageBookingsPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ProviderRequestsPage = lazy(() => import("./pages/provider/ProviderRequestsPage"));
const ProviderRequestDetailsPage = lazy(() => import("./pages/provider/ProviderRequestDetailsPage"));

// --- Loading Component ---
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-main-bg">
    <Loader size={48} className="animate-spin text-main-accent mb-4" />
    <p className="text-main-text font-bold animate-pulse">جاري التحميل...</p>
  </div>
);

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>

            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />

            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<MainLayout />}>
                    
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/service/:id" element={<ServiceDetailPage />} />
                    <Route path="/about-us" element={<AboutUsPage />} />
                    <Route path="/cart" element={<CartPage />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/provider-apply" element={<ProviderRegisterPage />} />

                    {/* Customer Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/my-bookings" element={<MyBookingsPage />} />
                      <Route path="/booking/:id" element={<BookingDetailPage />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      
                      {/* مسارات الطلبات الخاصة للعميل */}
                      <Route path="/create-request" element={<CreateRequestPage />} />
                      <Route path="/my-requests" element={<MyCustomRequestsPage />} />
                      <Route path="/my-requests/:id" element={<RequestDetailsPage />} />
                    </Route>

                    {/* Provider & Admin Routes */}
                    <Route element={<ProviderRoute />}>
                      <Route path="/add-service" element={<AddServicePage />} />
                      <Route path="/manage-bookings" element={<ManageBookingsPage />} />
                      <Route path="/provider-requests" element={<ProviderRequestsPage />} />
                      <Route path="/provider-requests/:id" element={<ProviderRequestDetailsPage />} />
                      
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>

                  </Route>
                </Routes>

              </Suspense>
            </ErrorBoundary>

          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;