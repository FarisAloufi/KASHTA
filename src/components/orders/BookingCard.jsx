import React from "react";
import { Link } from "react-router-dom";
import { User, Calendar, Hash } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-amber-100 text-amber-800 border border-amber-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border border-blue-200";
    case "ready": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "completed": return "bg-gray-100 text-gray-800 border border-gray-200";
    case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
    default: return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending": return "قيد الانتظار";
    case "confirmed": return "قيد التجهيز";
    case "ready": return "في الطريق";
    case "completed": return "مكتمل";
    case "cancelled": return "ملغي";
    default: return "غير معروف";
  }
};

function BookingCard({ booking, children }) {
  const dateObject = new Date(booking.bookingDate);
  const bookingDateFormatted = !isNaN(dateObject)
    ? dateObject.toLocaleString("ar-SA", {
      dateStyle: "full",
      timeStyle: "short",
    })
    : "تاريخ غير محدد";


  const displayId = booking.orderGroupId || booking.id;

  const totalPrice = booking.totalPrice || 0;

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


        <div className="flex justify-between items-start mb-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
          <div className="flex items-center gap-1 text-main-text/40">
            <Hash size={16} />
            <span className="font-mono text-lg font-bold">{displayId}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-main-text/60 mb-1">
            صاحب الطلب:
          </h3>
          <div className="flex items-center gap-3 bg-main-bg/5 p-3 rounded-xl border border-main-bg/5">
            <div className="w-10 h-10 bg-main-text text-second-bg rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <span className="font-extrabold text-main-text text-xl">
              {booking.userName || "عميل"}
            </span>
          </div>
        </div>

        <hr className="border-main-bg/10 my-4" />


        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 text-main-text/70 text-sm">
            <Calendar size={16} />
            <span>{bookingDateFormatted}</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-main-text/60 mb-1 font-bold">الإجمالي</p>
            <p className="text-2xl font-black text-green-700">
              {Number(totalPrice).toLocaleString("ar-SA")} <span className="text-sm text-main-text font-medium">ريال</span>
            </p>
          </div>
        </div>


        {children && (
          <div className="border-t border-main-bg/20 pt-4 mt-4" onClick={handleChildClick}>
            {children}
          </div>
        )}
      </div>
    </Link>
  );
}

export default BookingCard;