import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import {
  FaSignOutAlt,
  FaPlusCircle,
  FaTh,
  FaCalendarAlt,
  FaShoppingCart,
  FaListAlt,
} from "react-icons/fa";
import KashtaLogo from "../../assets/Kashtalogo.png";

// --- Constants & Configuration ---

/**
 * Navigation Data Configuration
 * Renamed 'path' to 'to' to match React Router's Link prop requirement.
 */

// Base links visible to everyone
const BASE_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/services", label: "الخدمات" },
  { to: "/about-us", label: "من نحن" },
];

// Links for Admin role
const ADMIN_LINKS = [
  { to: "/admin", label: "الداشبورد", icon: null },
  { to: "/manage-bookings", label: "إدارة الحجوزات", icon: FaTh },
  { to: "/add-service", label: "إضافة خدمة", icon: FaPlusCircle },
];

// Links for Provider role
const PROVIDER_LINKS = [
  { to: "/manage-bookings", label: "إدارة خدماتي", icon: FaListAlt },
  { to: "/add-service", label: "إضافة خدمة", icon: FaPlusCircle },
];

// Links for Customer role
const CUSTOMER_LINKS = [
  { to: "/my-bookings", label: "حجوزاتي", icon: FaCalendarAlt },
];

// --- Sub-Components ---

/**
 * Reusable NavLink component.
 * Renders a consistent link with hover effects and optional icon.
 */
const NavLink = ({ to, label, icon: Icon }) => (
  <Link
    to={to}
    className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-1"
  >
    {label}
    {Icon && <Icon size={18} />}
  </Link>
);

// --- Main Component ---

function Navbar() {
  const { currentUser, userRole, userData } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // Handle User Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  // Determine user avatar initial (First letter of name or email)
  const userInitial = userData?.name 
    ? userData.name.charAt(0).toUpperCase() 
    : currentUser?.email?.charAt(0).toUpperCase();

  return (
    <nav className="bg-second-bg text-main-text shadow-md py-2 sticky top-0 z-[1000]">
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* 1. Logo Section */}
        <Link
          to="/"
          className="text-2xl font-bold text-main-text flex items-center gap-2 hover:text-main-accent transition-colors"
        >
          <img 
            src={KashtaLogo} 
            alt="KASHTA Logo" 
            className="w-16 h-16 object-contain" 
          />
        </Link>

        {/* 2. Navigation Links Section (Desktop) */}
        <div className="flex items-center gap-6 hidden md:flex">
          
          {/* Render Base Links */}
          {BASE_LINKS.map((link) => (
            <NavLink key={link.to} {...link} />
          ))}

          {/* Render Admin Links */}
          {currentUser && userRole === "admin" && (
            ADMIN_LINKS.map((link) => (
              <NavLink key={link.to} {...link} />
            ))
          )}

          {/* Render Provider Links */}
          {currentUser && userRole === "provider" && (
            PROVIDER_LINKS.map((link) => (
              <NavLink key={link.to} {...link} />
            ))
          )}

          {/* Render Customer Links */}
          {currentUser && userRole === "customer" && (
            CUSTOMER_LINKS.map((link) => (
              <NavLink key={link.to} {...link} />
            ))
          )}
        </div>

        {/* 3. User Actions Section (Cart, Profile, Auth) */}
        <div className="flex items-center gap-4">
          
          {/* Shopping Cart Icon */}
          {currentUser && (
            <Link to="/cart" className="relative text-main-text hover:text-main-accent transition-colors duration-200">
              <FaShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Avatar */}
          {currentUser && (
            <Link
              to="/profile"
              className="relative text-main-text hover:text-main-accent transition-colors duration-200"
              title="الملف الشخصي"
            >
              <div className="w-9 h-9 bg-main-text text-second-bg rounded-full flex items-center justify-center font-bold border-2 border-main-text hover:border-main-accent transition-colors text-lg shadow-sm">
                {userInitial}
              </div>
            </Link>
          )}

          {/* Authentication Buttons */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="bg-main-bg text-white px-4 py-2 rounded-full hover:text-main-accent transition-colors duration-200 flex items-center gap-1 text-base font-bold shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt size={16} /> تسجيل الخروج
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-main-bg text-white px-4 py-2 rounded-full hover:text-main-accent transition-colors duration-200 text-base font-bold shadow-md hover:shadow-lg"
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