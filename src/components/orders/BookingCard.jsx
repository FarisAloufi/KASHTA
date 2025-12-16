import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Calendar, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { translateText } from "../../utils/googleTranslate";

function BookingCard({ booking, children }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { status, orderGroupId, id, bookingDate, totalPrice, userName } = booking;

  // --- 🆕 Translation Logic for User Name ---
  const STATUS_CONFIG = {
    pending: { label: t('status.pending'), className: "bg-amber-100 text-amber-800 border border-amber-200" },
    confirmed: { label: t('status.confirmed'), className: "bg-blue-100 text-blue-800 border border-blue-200" },
    ready: { label: t('status.ready'), className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    completed: { label: t('status.completed'), className: "bg-gray-100 text-gray-800 border border-gray-200" },
    cancelled: { label: t('status.cancelled'), className: "bg-red-100 text-red-800 border border-red-200" },
    default: { label: t('status.unknown'), className: "bg-gray-100 text-gray-800 border border-gray-200" },
  };

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  const displayId = orderGroupId || id;

  const handleChildClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const formattedDate = new Date(bookingDate).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: "full", timeStyle: "short"
  });

  return (
    <Link
      to={`/booking/${displayId}`}
      className="block bg-second-bg text-main-text rounded-3xl shadow-lg overflow-hidden border border-main-bg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group relative"
    >
      <div className="p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
          <div className="flex items-center gap-1 text-main-text/40">
            <Hash size={16} />
            <span className="font-mono text-lg font-bold">{displayId}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-main-text/60 mb-1">
            {t('booking_card.customer')}:
          </h3>
          <div className="flex items-center gap-3 bg-main-bg/5 p-3 rounded-xl border border-main-bg">
            <div className="w-10 h-10 bg-main-text text-second-bg rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="font-extrabold text-main-text text-xl">
              {userName || t('common.client')}
            </span>
          </div>
        </div>

        <hr className="border-main-bg my-4" />

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 text-main-text/70 text-sm">
            <Calendar size={16} />
            <span dir="ltr">{formattedDate}</span>
          </div>
          
          <div className="text-left rtl:text-right">
            <p className="text-xs text-main-text/60 mb-1 font-bold">{t('booking_card.total')}</p>
            <p className="text-2xl font-black text-green-700 flex items-center gap-1">
              {Number(totalPrice || 0).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')} 
              <span className="text-sm text-main-text font-medium">{t('services.currency')}</span>
            </p>
          </div>
        </div>

        {children && (
          <div className="border-t border-main-bg pt-4 mt-4" onClick={handleChildClick}>
            {children}
          </div>
        )}

      </div>
    </Link>
  );
}

export default BookingCard;