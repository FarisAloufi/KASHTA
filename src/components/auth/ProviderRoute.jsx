import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProviderRoute() {
  const { currentUser, userRole, loading } = useAuth(); 

  if (loading) {
   
    return <div className="text-center p-10"><h1>جاري التحقق...</h1></div>;
  }

  if (!currentUser) {
    
    return <Navigate to="/login" replace />;
  }

  if (currentUser && userRole !== 'provider') {
    
    console.warn("تم منع الوصول: المستخدم ليس مزود خدمة.");
    return <Navigate to="/" replace />;
  }

 
  return <Outlet />;
}

export default ProviderRoute;