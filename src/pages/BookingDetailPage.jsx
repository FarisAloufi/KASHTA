import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import MapDisplay from "../components/map/MapDisplay";
import StatusTracker from "../components/orders/StatusTracker";
import RatingForm from "../components/orders/RatingForm";
import DisplayRating from "../components/orders/DisplayRating";
import { useAuth } from "../context/AuthContext";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "ready":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
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
    <div className="bg-main-bg min-h-screen py-10">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="bg-second-bg text-main-text p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-main-text break-all">
                ملخص الطلب: {id}
              </h1>
              <p className="text-2xl text-green-700 font-bold mt-2">
                الإجمالي: {Number(totalPrice).toLocaleString("ar-SA")} ريال
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm ${getStatusColor(mainBooking.status)}`}
            >
              {getStatusText(mainBooking.status)}
            </span>
          </div>

          <hr className="my-6 border-main-bg/20" />

          <div className="mb-6">
            <StatusTracker status={mainBooking.status} />
          </div>

          <hr className="my-6 border-main-bg/20" />

          <div>
            <h3 className="font-bold text-main-bg text-lg mb-4">
              الخدمات المطلوبة ({servicesList.length}):
            </h3>
            <div className="space-y-2">
              {servicesList.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-main-bg/10 p-3 rounded-lg">
                  <span className="font-medium text-main-text">
                    {item.serviceName} (x{item.quantity || 1})
                  </span>
                  <span className="font-bold text-main-text">

                    {(Number(item.servicePrice || item.price) * Number(item.quantity || 1)).toLocaleString("ar-SA")} ر.س
                  </span>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-6 border-main-bg/20" />

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-bold text-main-text text-lg">تاريخ ووقت "الكشتة"</h3>
              <p className="text-main-text/90 text-lg">{bookingDateFormatted}</p>
            </div>
            <div>
              <h3 className="font-bold text-main-text text-lg">الموقع المحدد</h3>
            </div>
          </div>

          <div className="w-full h-80 rounded-lg overflow-hidden border border-main-bg/20">
            <MapDisplay location={mainBooking.location} />
          </div>

          {userRole === "customer" && (
            <>
              {mainBooking.status === "completed" && !mainBooking.rated && (
                <RatingForm booking={mainBooking} />
              )}
              {mainBooking.status === "completed" && mainBooking.rated && (
                <div className="border-t-2 border-dashed border-main-bg/20 pt-6 mt-6">
                  <p className="text-center text-xl font-bold text-green-600">👍 شكراً لك! تقييمك وصل.</p>
                </div>
              )}
            </>
          )}

          {userRole === "provider" && (
            <>
              {mainBooking.rated && <DisplayRating bookingId={mainBooking.id} />}
               {!mainBooking.rated && (
                <div className="border-t-2 border-dashed border-main-bg/20 pt-6 mt-6">
                  <p className="text-center text-main-text/70 font-medium">بانتظار تقييم العميل...</p>
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