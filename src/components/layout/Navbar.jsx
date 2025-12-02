import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { auth } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

import {
  FaSignOutAlt,
  FaPlusCircle,
  FaTh,
  FaCalendarAlt,
  FaShoppingCart,
  FaListAlt,
} from "react-icons/fa";
import KashtaLogo from "../../assets/Kashtalogo.png";

function Navbar() {
  const { currentUser, userRole, userData } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("خطأ في تسجيل الخروج:", err);
    }
  };

  return (
    <nav className="bg-second-bg text-main-text shadow-md py-2 sticky top-0 z-[1000]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-main-text flex items-center gap-2 hover:text-main-accent transition-colors"
        >
          <img src={KashtaLogo} alt="KASHTA Logo" className="w-16 h-16" />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200">
            الرئيسية
          </Link>
          <Link to="/services" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200">
            الخدمات
          </Link>
          <Link to="/about-us" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200">
            من نحن
          </Link>


          {currentUser && userRole === "admin" && (
            <>
              <Link to="/admin" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
                الداشبورد
              </Link>
              <Link to="/manage-bookings" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
                إدارة الحجوزات <FaTh size={18} />
              </Link>
              <Link to="/add-service" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
                إضافة خدمة <FaPlusCircle size={18} />
              </Link>
            </>
          )}


          {currentUser && userRole === "provider" && (
            <>
              <Link to="/manage-bookings" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
                إدارة خدماتي <FaListAlt size={18} />
              </Link>
              <Link to="/add-service" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
                إضافة خدمة <FaPlusCircle size={18} />
              </Link>
            </>
          )}

          {currentUser && userRole === "customer" && (
            <Link to="/my-bookings" className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1">
              حجوزاتي <FaCalendarAlt size={18} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser && (
            <Link to="/cart" className="relative text-main-text hover:text-main-accent transition-colors duration-200">
              <FaShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}


          {currentUser && (
            <Link
              to="/profile"
              className="relative text-main-text hover:text-main-accent transition-colors duration-200"
              title="الملف الشخصي"
            >
              <div className="w-9 h-9 bg-main-text text-second-bg rounded-full flex items-center justify-center font-bold border-2 border-main-text hover:border-main-accent transition-colors text-lg">
                {userData?.name ? userData.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="bg-main-bg text-white px-4 py-2 rounded-full hover:text-main-accent transition-colors duration-200 flex items-center gap-1 text-base font-bold shadow-md"
            >
              <FaSignOutAlt size={16} /> تسجيل الخروج
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-main-bg text-white px-4 py-2 rounded-full hover:text-main-accent transition-colors duration-200 text-base font-bold shadow-md"
            >
              تسجيل / دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;