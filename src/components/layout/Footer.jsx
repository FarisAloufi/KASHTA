import React from 'react';
import { Link } from 'react-router-dom';

import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

function Footer() {
  return (
   
    <footer className="bg-[#d8ceb8ff] text-[#3e2723] py-12 mt-auto shadow-inner border-t border-[#3e2723]/20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">كشتة</h3>
          <p className="text-[#3e2723]/90">
            وجهتك الأولى لحجز أفضل الخيام والمستلزمات لرحلات التخييم.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
          <ul className="space-y-2">
           
            <li><Link to="/" className="text-[#3e2723]/90 hover:text-[#e48a4e] transition-colors duration-200">الرئيسية</Link></li>
            <li><Link to="/about-us" className="text-[#3e2723]/90 hover:text-[#e48a4e] transition-colors duration-200">عن كشتة</Link></li>
          </ul>
        </div>

        {/* Provider Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">للمزودين</h3>
          <ul className="space-y-2">
            <li><Link to="/add-service" className="text-[#3e2723]/90 hover:text-[#e48a4e] transition-colors duration-200">إضافة خدمة</Link></li>
            <li><Link to="/manage-bookings" className="text-[#3e2723]/90 hover:text-[#e48a4e] transition-colors duration-200">إدارة الحجوزات</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
          <div className="flex space-x-4 space-x-reverse">
           
            <a href="#" className="text-[#3e2723] hover:text-[#e48a4e] transition-colors duration-200"><FaFacebook size={24} /></a>
            <a href="#" className="text-[#3e2723] hover:text-[#e48a4e] transition-colors duration-200"><FaTwitter size={24} /></a>
            <a href="#" className="text-[#3e2723] hover:text-[#e48a4e] transition-colors duration-200"><FaInstagram size={24} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3e2723]/20 mt-8 pt-8 text-center text-[#3e2723]/80">
        <p>&copy; {new Date().getFullYear()} كشتة. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}

export default Footer;