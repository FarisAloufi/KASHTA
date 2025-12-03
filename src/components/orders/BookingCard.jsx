import React from "react";
import { Link } from "react-router-dom";
import { User, Calendar, Hash } from "lucide-react";

// --- Configuration & Constants ---

// Configuration object for booking statuses.
// Maps each status key to its display text and Tailwind CSS classes.
// This replaces the multiple switch statements (cleaner & easier to maintain).
const STATUS_CONFIG = {
  pending: {
    label: "قيد الانتظار",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  confirmed: {
    label: "قيد التجهيز",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  ready: {
    label: "في الطريق",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  completed: {
    label: "مكتمل",
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  },
  cancelled: {
    label: "ملغي",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
  // Default fallback for unknown statuses
  default: {
    label: "غير معروف",
    className: "bg-gray-100 text-gray-800 border border-gray-200",
  },
};

// --- Helper Functions ---

/**
 * Formats the booking date timestamp into a readable locale string.
 */
const formatBookingDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date)
    ? date.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" })
    : "تاريخ غير محدد";
};

// --- Main Component ---

function BookingCard({ booking, children }) {
  // Destructure booking properties for cleaner access within JSX
  const { status, orderGroupId, id, bookingDate, totalPrice, userName } = booking;

  // Resolve status styling and label safely
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.default;
  
  // Prefer orderGroupId for display, fallback to document ID
  const displayId = orderGroupId || id;

  // Prevents navigation when clicking interactive elements inside the card (like action buttons)
  const handleChildClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Link
      to={`/booking/${displayId}`}
      className="block bg-second-bg text-main-text rounded-3xl shadow-lg overflow-hidden border border-main-bg/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group relative"
    >
      <div className="p-6">
        
        {/* Header: Status Badge & Order ID */}
        <div className="flex justify-between items-start mb-4">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.className}`}
          >
            {statusInfo.label}
          </span>
          
          <div className="flex items-center gap-1 text-main-text/40">
            <Hash size={16} />
            <span className="font-mono text-lg font-bold">{displayId}</span>
          </div>
        </div>

        {/* Customer Info Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-main-text/60 mb-1">
            صاحب الطلب:
          </h3>
          <div className="flex items-center gap-3 bg-main-bg/5 p-3 rounded-xl border border-main-bg/5">
            <div className="w-10 h-10 bg-main-text text-second-bg rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="font-extrabold text-main-text text-xl">
              {userName || "عميل"}
            </span>
          </div>
        </div>

        <hr className="border-main-bg/10 my-4" />

        {/* Footer: Date & Price */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 text-main-text/70 text-sm">
            <Calendar size={16} />
            <span>{formatBookingDate(bookingDate)}</span>
          </div>
          
          <div className="text-left">
            <p className="text-xs text-main-text/60 mb-1 font-bold">الإجمالي</p>
            <p className="text-2xl font-black text-green-700">
              {Number(totalPrice || 0).toLocaleString("ar-SA")} 
              <span className="text-sm text-main-text font-medium mr-1">ريال</span>
            </p>
          </div>
        </div>

        {/* Action Buttons Area (if any children are passed) */}
        {children && (
          <div 
            className="border-t border-main-bg/20 pt-4 mt-4" 
            onClick={handleChildClick}
          >
            {children}
          </div>
        )}

      </div>
    </Link>
  );
}

export default BookingCard;