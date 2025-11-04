import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { currentUser, loading } = useAuth(); 

  if (loading) {
    return <div>جاري التحقق...</div>; 
  }

  if (!currentUser) {

    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
}

export default ProtectedRoute;