import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import MapDisplay from "../components/map/MapDisplay";
import StatusTracker from "../components/orders/StatusTracker";
import RatingForm from "../components/orders/RatingForm";
import DisplayRating from "../components/orders/DisplayRating";
import { useAuth } from "../context/AuthContext";
// Added Clock and CheckCircle2 to imports
import { User, MapPin, Calendar, Hash, ShoppingBag, CreditCard, Clock, CheckCircle2 } from "lucide-react";

// --- Configuration ---

// Status configuration map (Color & Text)
const STATUS_CONFIG = {
  pending: {
    color: "bg-amber-100 text-amber-800 border border-amber-200",
    text: "قيد الانتظار"
  },
  confirmed: {
    color: "bg-blue-100 text-blue-800 border border-blue-200",
    text: "قيد التجهيز"
  },
  ready: {
    color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    text: "في الطريق"
  },
  completed: {
    color: "bg-gray-100 text-gray-800 border border-gray-200",
    text: "مكتمل"
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border border-red-200",
    text: "ملغي"
  },
  default: {
    color: "bg-gray-100 text-gray-800 border border-gray-200",
    text: "غير معروف"
  }
};

// --- Sub-Components ---

const BookingHeader = ({ id, status, userName }) => {
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.default;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b-2 border-dashed border-main-bg/20 pb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-main-bg text-second-bg p-2 rounded-lg shadow-sm">
            <Hash size={24} />
          </span>
          <div>
            <p className="text-xs text-main-text/60 font-bold">رقم الطلب</p>
            <h1 className="text-3xl font-black text-main-text font-mono tracking-wide">{id}</h1>
          </div>
        </div>
        <span className={`inline-block px-5 py-2 rounded-xl text-sm font-bold shadow-sm ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      <div className="w-full md:w-auto bg-white/60 p-4 rounded-2xl border border-main-bg/5 min-w-[220px] shadow-sm">
        <p className="text-xs text-main-text/50 font-bold mb-2">بيانات العميل</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-main-text text-second-bg rounded-full flex items-center justify-center shadow-md">
            <User size={24} />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-main-text line-clamp-1">{userName || "عميل"}</span>
            <span className="text-xs text-main-text/60 bg-main-bg/10 px-2 py-0.5 rounded-md">عميل موثوق</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesList = ({ services, totalPrice }) => (
  <div className="bg-main-bg/5 rounded-3xl p-6 mb-8 border border-main-text/5">
    <h3 className="font-extrabold text-main-text text-xl mb-6 flex items-center gap-2">
      <ShoppingBag className="text-main-accent" />
      الخدمات المطلوبة 
      <span className="bg-white text-main-text text-xs px-2.5 py-1 rounded-full shadow-sm border border-main-text/10">{services.length}</span>
    </h3>
    
    <div className="space-y-4">
      {services.map((item, index) => (
        <div key={index} className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-main-bg/5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 w-full sm:w-auto mb-3 sm:mb-0">
            {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
            ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            )}
            <div>
              <p className="font-bold text-main-text text-lg">{item.serviceName}</p>
              <p className="text-sm text-main-text/50 font-medium bg-main-bg/10 px-2 py-0.5 rounded-lg w-fit mt-1">الكمية: {item.quantity}</p>
            </div>
          </div>
          <span className="font-black text-main-text text-xl bg-main-bg/5 px-4 py-2 rounded-xl">
            {(Number(item.servicePrice || item.price) * Number(item.quantity || 1)).toLocaleString("ar-SA")} <span className="text-xs">ر.س</span>
          </span>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t-2 border-dashed border-main-text/10">
      <div className="flex items-center gap-2 text-main-text/60 font-bold text-lg mb-2 sm:mb-0">
          <CreditCard size={24} /> الإجمالي النهائي
      </div>
      <span className="text-4xl font-black text-green-700 tracking-tight">
        {Number(totalPrice).toLocaleString("ar-SA")} <span className="text-lg text-main-text font-bold">ريال</span>
      </span>
    </div>
  </div>
);

// --- Main Component ---

function BookingDetailPage() {
  const { id } = useParams();
  const { userRole } = useAuth();
  
  const [mainBooking, setMainBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Real-time listener for the specific booking
  useEffect(() => {
    setLoading(true);
    setError("");

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("orderGroupId", "==", id));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setMainBooking({
            id: querySnapshot.docs[0].id,
            ...docData
          });
        } else {
          setError("لم يتم العثور على هذا الطلب.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to booking:", err);
        setError("حدث خطأ في جلب البيانات.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Loading View
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-main-text/60">جاري تحميل تفاصيل الطلب...</h1>
        </div>
      </div>
    );
  }

  // Error View
  if (error) return <div className="flex justify-center items-center h-screen"><h1 className="text-2xl font-bold text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100">{error}</h1></div>;
  if (!mainBooking) return null;

  // Formatting Date
  const dateObject = new Date(mainBooking.bookingDate);
  const bookingDateFormatted = !isNaN(dateObject)
    ? dateObject.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" })
    : "تاريخ غير محدد";

  return (
    <div className="bg-main-bg min-h-screen py-12 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl">

        <div className="bg-second-bg text-main-text p-8 rounded-[2.5rem] shadow-2xl border border-main-bg/10">
          
          {/* 1. Header Section */}
          <BookingHeader 
            id={id} 
            status={mainBooking.status} 
            userName={mainBooking.userName} 
          />

          {/* 2. Status Tracker */}
          <div className="mb-10 bg-white/40 p-6 rounded-3xl border border-main-bg/5">
            <StatusTracker status={mainBooking.status} />
          </div>

          {/* 3. Services List */}
          <ServicesList 
            services={mainBooking.services || []} 
            totalPrice={mainBooking.totalPrice || 0} 
          />

          {/* 4. Details Grid (Date & Location) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/60 p-6 rounded-3xl border border-main-bg/5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-main-text text-sm mb-3 flex items-center gap-2 uppercase tracking-wider opacity-70">
                <Calendar size={18} className="text-main-accent" /> موعد الحجز
              </h3>
              <p className="text-main-text font-black text-xl">{bookingDateFormatted}</p>
            </div>
            
            <div className="bg-white/60 p-6 rounded-3xl border border-main-bg/5 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-main-text text-sm mb-3 flex items-center gap-2 uppercase tracking-wider opacity-70">
                <MapPin size={18} className="text-main-accent" /> الموقع
              </h3>
              <div className="h-48 rounded-2xl overflow-hidden border border-main-text/10 shadow-inner relative group">
                 <MapDisplay location={mainBooking.location} />
                 <div className="absolute inset-0 border-4 border-transparent group-hover:border-main-accent/20 rounded-2xl transition-colors pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* 5. Rating Section */}
          {userRole === "customer" && (
            <>
              {mainBooking.status === "completed" && !mainBooking.rated && (
                <RatingForm booking={mainBooking} />
              )}
              {mainBooking.status === "completed" && mainBooking.rated && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mt-8">
                  <p className="text-xl font-bold text-green-700 flex items-center justify-center gap-2">
                    <CheckCircle2 size={24} /> شكراً لك! تقييمك وصل.
                  </p>
                </div>
              )}
            </>
          )}

          {userRole === "provider" && (
            <>
              {mainBooking.rated && <DisplayRating bookingId={mainBooking.id} />}
              {!mainBooking.rated && (
                <div className="text-center py-8 bg-main-bg/5 rounded-2xl border-2 border-dashed border-main-bg/20 mt-8">
                  <p className="text-main-text/50 font-bold flex items-center justify-center gap-2">
                    <Clock size={20} /> بانتظار تقييم العميل...
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default BookingDetailPage;