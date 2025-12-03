import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * A protected route wrapper that restricts access to Providers and Admins only.
 * Redirects unauthorized users to the home page.
 */
function ProviderRoute() {
  const { currentUser, userRole, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={40} />
      </div>
    );
  }

  // 2. Not Logged In: Redirect to Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role Check: Allow access only if role is 'provider' or 'admin'
  const isAuthorized = userRole === "provider" || userRole === "admin";

  if (!isAuthorized) {
    // Redirect unauthorized users (e.g., customers) to Home
    return <Navigate to="/" replace />;
  }

  // 4. Authorized: Render the requested route
  return <Outlet />;
}

export default ProviderRoute;