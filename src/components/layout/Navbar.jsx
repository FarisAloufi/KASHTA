import React from "react";
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";

import {
  FaPlusCircle,
  FaTh,
  FaCalendarAlt,
  FaShoppingCart,
  FaListAlt,
} from "react-icons/fa";
import KashtaLogo from "../../assets/Kashtalogo.png";

// --- Sub-Components ---

const NavLink = ({ to, label, icon: Icon }) => (
  <Link
    to={to}
    className="text-main-text hover:text-main-accent font-bold text-base transition-colors duration-200 flex items-center gap-2 whitespace-nowrap px-3 py-1 rounded-lg hover:bg-main-text/5"
  >
    {Icon && <Icon size={16} />}
    {label}
  </Link>
);

// --- Main Component ---

function Navbar() {
  const { currentUser, userRole, userData } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const BASE_LINKS = [
    { to: "/", label: t('navbar.home') },
    { to: "/services", label: t('navbar.services') },
    { to: "/about-us", label: t('navbar.about') },
  ];

  const ADMIN_LINKS = [
    { to: "/admin", label: t('navbar.dashboard'), icon: null },
    { to: "/manage-bookings", label: t('navbar.manage_bookings'), icon: FaTh },
    { to: "/add-service", label: t('navbar.add_service'), icon: FaPlusCircle },
  ];

  const PROVIDER_LINKS = [
    { to: "/manage-bookings", label: t('navbar.manage_services'), icon: FaListAlt },
    { to: "/add-service", label: t('navbar.add_service'), icon: FaPlusCircle },
  ];

  const CUSTOMER_LINKS = [
    { to: "/my-bookings", label: t('navbar.my_bookings'), icon: FaCalendarAlt },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const userInitial = userData?.name 
    ? userData.name.charAt(0).toUpperCase() 
    : currentUser?.email?.charAt(0).toUpperCase();

  return (
    <nav className="bg-second-bg text-main-text shadow-md py-3 sticky top-0 z-[1000] h-20 transition-colors duration-300">
      
      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-full">
        
        {/* --- 1. Left Section: Logo --- */}
        <div className="flex items-center shrink-0">
            <Link to="/" className="hover:opacity-90 transition-opacity flex items-center">
                <img 
                    src={KashtaLogo} 
                    alt="KASHTA Logo" 
                    className="h-14 md:h-16 w-auto object-contain drop-shadow-sm" 
                />
            </Link>
        </div>

        {/* --- 2. Center Section: Navigation Links --- */}
        <div className="hidden lg:flex flex-1 justify-center items-center px-4">
          
          <div className="flex items-center gap-1 xl:gap-2">

              {BASE_LINKS.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}

              {currentUser && userRole && (
                <div className="h-6 w-[2px] bg-main-text rounded-full mx-3"></div>
              )}

              {currentUser && userRole === "admin" && (
                ADMIN_LINKS.map((link) => <NavLink key={link.to} {...link} />)
              )}

              {currentUser && userRole === "provider" && (
                PROVIDER_LINKS.map((link) => <NavLink key={link.to} {...link} />)
              )}

              {currentUser && userRole === "customer" && (
                CUSTOMER_LINKS.map((link) => <NavLink key={link.to} {...link} />)
              )}
          </div>
        </div>

        {/* --- 3. Right Section: User Actions & Settings --- */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          
          {/* Settings Group */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-main-text/5 hover:bg-main-accent/10 text-main-text hover:text-main-accent transition-all flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
                onClick={toggleLanguage} 
                className="flex items-center justify-center p-2 rounded-full bg-main-text/5 hover:bg-main-accent/10 text-main-text/80 hover:text-main-accent transition-all"
            >
                <Globe size={20} />
                <span className="hidden xl:block ml-1 text-xs font-bold uppercase">
                  {i18n.language === 'ar' ? 'EN' : 'AR'}
                </span>
            </button>
          </div>

          {currentUser && (
            <div className="h-8 w-px bg-main-text/10 mx-1 hidden md:block"></div>
          )}

          {/* User Specific Actions */}
          <div className="flex items-center gap-3">
            
            {/* Cart Icon */}
            {currentUser && userRole === "customer" && (
              <Link to="/cart" className="relative p-2 hover:bg-main-bg/10 rounded-full transition-colors group">
                <FaShoppingCart size={22} className="text-main-text group-hover:text-main-accent" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-main-bg">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Profile & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="w-10 h-10 md:w-11 md:h-11 bg-main-text text-second-bg rounded-full flex items-center justify-center font-bold text-lg shadow-md hover:scale-105 transition-transform border-2 border-transparent hover:border-main-accent"
                    title={t('navbar.profile')}
                  >
                      {userInitial}
                  </Link>
                  
                  <button
                      onClick={handleLogout}
                      className="hidden md:flex bg-main-bg hover:bg-main-accent text-white px-5 py-2.5 rounded-full transition-all duration-300 items-center gap-2 text-sm font-bold shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                      <LogOut size={18} className="rtl:rotate-180" /> 
                      <span>{t('navbar.logout')}</span>
                  </button>
              </div>
            ) : (
              <>
               <div className="h-8 w-px bg-main-text/10 mx-1 hidden md:block"></div>
               <Link
                to="/login"
                className="bg-main-text text-second-text px-6 md:px-8 py-2.5 rounded-full hover:bg-main-accent hover:text-main-text transition-all duration-300 text-sm font-extrabold shadow-lg hover:shadow-main-accent/20 whitespace-nowrap"
              >
                {t('navbar.login')}
              </Link>
              </>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;