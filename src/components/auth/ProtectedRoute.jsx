import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

/**
 * A wrapper component to protect routes that require authentication.
 * If the user is not logged in, they are redirected to the login page.
 */
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // 1. Loading State: Wait for auth status to be determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={40} />
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated: Render the requested route
  return <Outlet />;
}

export default ProtectedRoute;