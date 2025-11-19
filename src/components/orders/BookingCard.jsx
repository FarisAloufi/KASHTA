import React from "react";
import { Link } from "react-router-dom";

const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "confirmed": return "bg-blue-100 text-blue-800";
    case "ready": return "bg-green-100 text-green-800";
    case "completed": return "bg-gray-100 text-gray-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
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


  const totalItemsCount = booking.services ? booking.services.length : (booking.totalItems || 0);
  

  const totalPrice = booking.totalPrice || 0;

  const handleChildClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Link
      to={`/booking/${displayId}`}
      className="block bg-second-bg text-main-text rounded-3xl shadow-lg overflow-hidden border border-main-bg/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-main-text break-all">
             رقم الطلب: {displayId}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>

       

        <p className="text-lg text-green-700 font-semibold mb-2">
          {Number(totalPrice).toLocaleString("ar-SA")} ريال
        </p>

        <p className="text-main-text/80 mb-4">
          <strong>التاريخ:</strong> {bookingDateFormatted}
        </p>

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