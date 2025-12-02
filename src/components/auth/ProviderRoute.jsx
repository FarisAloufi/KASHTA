import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Loader } from "lucide-react";

function ProviderRoute() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== "provider" && userRole !== "admin") {
    console.warn("تم منع الوصول: المستخدم ليس مزود خدمة.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProviderRoute;