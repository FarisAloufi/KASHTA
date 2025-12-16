import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Loader, Clock, AlertTriangle, ShieldAlert } from "lucide-react"; // أيقونات للحالات

/**
 * A protected route wrapper that restricts access to Providers and Admins only.
 * It also checks the approval status for providers.
 */
function ProviderRoute() {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [status, setStatus] = useState(null); // 'pending', 'approved', 'rejected'
  const [checkingStatus, setCheckingStatus] = useState(true);

  // 1. Fetch User Status from Firestore
  useEffect(() => {
    const fetchStatus = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setStatus(userDoc.data().status);
          }
        } catch (error) {
          console.error("Error fetching status:", error);
        }
      }
      setCheckingStatus(false);
    };

    if (!authLoading) {
      fetchStatus();
    }
  }, [currentUser, authLoading]);

  // 2. Loading State (Auth or Firestore check)
  if (authLoading || checkingStatus) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={40} />
      </div>
    );
  }

  // 3. Not Logged In: Redirect to Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 4. Role Check: Allow access only if role is 'provider' or 'admin'
  const isAuthorized = userRole === "provider" || userRole === "admin";

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // 5. 🛑 Status Check for Providers (Admins bypass this)
  if (userRole === "provider") {
    
    // الحالة: قيد الانتظار (Pending)
    if (status === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
          <div className="max-w-md w-full bg-second-bg rounded-3xl shadow-xl p-8 text-center border border-main-bg">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock size={40} className="text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-main-text mb-4">الحساب قيد المراجعة</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              شكراً لتسجيلك! طلبك للانضمام كمقدم خدمة قيد المراجعة حالياً من قبل الإدارة.
              سيتم تفعيل حسابك وإشعارك قريباً.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-main-text text-second-text px-6 py-3 rounded-xl font-bold hover:bg-main-accent transition-all"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    // الحالة: مرفوض (Rejected)
    if (status === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
          <div className="max-w-md w-full bg-second-bg rounded-3xl shadow-xl p-8 text-center border border-red-200">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={40} className="text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-red-600 mb-4">عذراً، تم رفض الطلب</h2>
            <p className="text-gray-600 mb-6">
              نأسف لإبلاغك بأن طلبك لم يستوفِ الشروط المطلوبة حالياً. يرجى التواصل مع الدعم الفني للمزيد من التفاصيل.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-main-text underline hover:text-red-600 font-bold"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }
  }

  // 6. Authorized & Approved: Render the requested route
  return <Outlet />;
}

export default ProviderRoute;