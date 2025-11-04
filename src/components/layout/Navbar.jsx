import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt, FaPlusCircle, FaTh, FaCalendarAlt } from 'react-icons/fa'; 
import KashtaLogo from '../../assets/Kashtalogo.png';

function Navbar() {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("خطأ في تسجيل الخروج:", err);
    }
  };

  return (
    <nav className="bg-[#d8ceb8ff] text-[#3e2723] shadow-md py-4 sticky top-0 z-[1000]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
      
        <Link to="/" className="text-2xl font-bold text-[#3e2723] flex items-center gap-2 hover:text-[#e48a4e] transition-colors">
          {<img src={KashtaLogo} alt="KASHTA Logo" className="h-15 w-auto" />}
        </Link>

        <div className="flex items-center gap-6">

          

          
          {currentUser && userRole === 'provider' && (
            <>
              <Link to="/add-service" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200 flex items-center gap-">
                <FaPlusCircle size={18} /> إضافة خدمة
              </Link>
              <Link to="/manage-bookings" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200 flex items-center gap-1">
                <FaTh size={18} /> إدارة الحجوزات
              </Link>
            </>
          )}
          {currentUser && userRole === 'customer' && (
            <Link to="/my-bookings" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200 flex items-center gap-1">
              <FaCalendarAlt size={18} /> حجوزاتي
            </Link>
            
          )}

           <Link to="/about-us" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200">
            من نحن
          </Link>
          
          
          
          <Link to="/services" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200">
            الخدمات
          </Link>
          <Link to="/" className="text-[#3e2723] hover:text-[#e48a4e] font-bold transition-colors duration-200">
            الرئيسية
          </Link>

         
        </div>

        
        <div className="flex items-center">
          {currentUser ? (
            
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-[#2c1810] transition-colors duration-200 flex items-center gap-1 text-sm font-medium shadow-md"
            >
              <FaSignOutAlt size={16} /> تسجيل الخروج
            </button>
          ) : (
          
            <Link
              to="/login" 
              className="bg-black text-white px-4 py-2 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
            >
              تسجيل / تسجيل الدخول 
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;