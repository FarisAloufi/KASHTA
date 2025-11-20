import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import MapDisplay from "../components/map/MapDisplay";
import StatusTracker from "../components/orders/StatusTracker";
import RatingForm from "../components/orders/RatingForm";
import DisplayRating from "../components/orders/DisplayRating";
import { useAuth } from "../context/AuthContext";
import { User, MapPin, Calendar, Hash } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "pending": return "bg-amber-100 text-amber-800 border border-amber-200";
    case "confirmed": return "bg-blue-100 text-blue-800 border border-blue-200";
    case "ready": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "completed": return "bg-gray-100 text-gray-800 border border-gray-200";
    case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
    default: return "bg-gray-100 text-gray-800 border border-gray-200";
  }
}

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

function BookingDetailPage() {
  const { id } = useParams();
  const [mainBooking, setMainBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userRole } = useAuth();

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
        console.error("خطأ في الاستماع للطلب:", err);
        setError("حدث خطأ في جلب البيانات.");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-second-text">جاري تحميل الطلب...</h1>
        </div>
      </div>
    );
  }

  if (error) return <h1 className="text-center text-2xl p-10 text-red-400">{error}</h1>;
  if (!mainBooking) return null;

  const servicesList = mainBooking.services || [];
  const totalPrice = mainBooking.totalPrice || 0;

  const dateObject = new Date(mainBooking.bookingDate);
  const bookingDateFormatted = !isNaN(dateObject)
    ? dateObject.toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" })
    : "تاريخ غير محدد";

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto p-6 max-w-4xl">

        <div className="bg-second-bg text-main-text p-8 rounded-3xl shadow-2xl border border-main-bg/10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b-2 border-dashed border-main-bg/20 pb-6">

            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-main-bg text-second-bg p-2 rounded-lg">
                  <Hash size={24} />
                </span>
                <div>
                  <p className="text-sm text-main-text/60 font-bold">رقم الطلب</p>
                  <h1 className="text-3xl font-black text-main-text font-mono tracking-wide">
                    {id}
                  </h1>
                </div>
              </div>
              <span
                className={`inline-block px-5 py-2 rounded-xl text-sm font-bold shadow-sm ${getStatusColor(mainBooking.status)}`}
              >
                {getStatusText(mainBooking.status)}
              </span>
            </div>


            <div className="w-full md:w-auto bg-white/50 p-4 rounded-2xl border border-main-bg/5 min-w-[200px]">
              <p className="text-xs text-main-text/50 font-bold mb-2">بيانات العميل</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-main-text text-second-bg rounded-full flex items-center justify-center shadow-md">
                  <User size={24} />
                </div>
                <div>
                  <span className="block text-xl font-extrabold text-main-text">{mainBooking.userName}</span>
                  <span className="text-xs text-main-text/60">عميل موثوق</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <StatusTracker status={mainBooking.status} />
          </div>

          <div className="bg-main-bg/5 rounded-2xl p-6 mb-8">
            <h3 className="font-extrabold text-main-bg text-xl mb-4 flex items-center gap-2">
              الخدمات المطلوبة <span className="bg-main-bg text-second-bg text-xs px-2 py-1 rounded-full">{servicesList.length}</span>
            </h3>
            <div className="space-y-3">
              {servicesList.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-main-bg/5">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <p className="font-bold text-main-text text-lg">{item.serviceName}</p>
                      <p className="text-xs text-main-text/50">الكمية: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-main-text text-lg">
                    {(Number(item.servicePrice || item.price) * Number(item.quantity || 1)).toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
              ))}
            </div>


            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-main-bg/10">
              <span className="text-xl font-bold text-main-text/70">الإجمالي النهائي</span>
              <span className="text-4xl font-black text-green-700">
                {Number(totalPrice).toLocaleString("ar-SA")} <span className="text-lg text-main-text">ريال</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/50 p-4 rounded-2xl border border-main-bg/5">
              <h3 className="font-bold text-main-text text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} /> موعد الحجز
              </h3>
              <p className="text-main-text font-medium text-lg">{bookingDateFormatted}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl border border-main-bg/5">
              <h3 className="font-bold text-main-text text-sm mb-2 flex items-center gap-2">
                <MapPin size={16} /> الموقع
              </h3>
              <p className="text-main-text/60 text-sm">تم تحديد الموقع على الخريطة أدناه</p>
            </div>
          </div>

          <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-main-bg/10 shadow-inner mb-8">
            <MapDisplay location={mainBooking.location} />
          </div>


          {userRole === "customer" && (
            <>
              {mainBooking.status === "completed" && !mainBooking.rated && (
                <RatingForm booking={mainBooking} />
              )}
              {mainBooking.status === "completed" && mainBooking.rated && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <p className="text-xl font-bold text-green-700">👍 شكراً لك! تقييمك وصل.</p>
                </div>
              )}
            </>
          )}

          {userRole === "provider" && (
            <>
              {mainBooking.rated && <DisplayRating bookingId={mainBooking.id} />}
              {!mainBooking.rated && (
                <div className="text-center py-6 bg-main-bg/5 rounded-2xl border border-dashed border-main-bg/20">
                  <p className="text-main-text/60 font-medium">بانتظار تقييم العميل...</p>
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