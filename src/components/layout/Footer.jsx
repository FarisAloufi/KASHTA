import React from "react";
import { Link } from "react-router-dom";

import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import KashtaLogo from "../../assets/Kashtalogo.png";

function Footer() {
  return (
    <footer className="bg-second-bg text-main-text py-12 mt-auto shadow-inner border-t border-main-text/20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <img src={KashtaLogo} alt="KASHTA Logo" className="h-24 w-24 mb-4" />
          <p className="text-main-text/90">
            وجهتك الأولى لحجز أفضل الخيام والمستلزمات لرحلات التخييم.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
              >
                الرئيسية
              </Link>
            </li>
            <li>
              <Link
                to="/about-us"
                className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
              >
                عن كشتة
              </Link>
            </li>
          </ul>
        </div>

        {/* Provider Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">للمزودين</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/add-service"
                className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
              >
                إضافة خدمة
              </Link>
            </li>
            <li>
              <Link
                to="/manage-bookings"
                className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
              >
                إدارة الحجوزات
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
          <div className="flex space-x-2">
            <a
              href="#"
              className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="#"
              className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="#"
              className="text-main-text/90 hover:text-main-accent transition-colors duration-200"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-main-text mt-8 pt-8 text-center text-main-text">
        <p>&copy; {new Date().getFullYear()} كشتة. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}

export default Footer;
