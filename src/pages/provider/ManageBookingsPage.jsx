import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import BookingCard from "../../components/orders/BookingCard";

function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, orderBy("createdAt", "desc"));

      const querySnapshot = await getDocs(q);
      const allBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(allBookings);
    } catch (err) {
      console.error("خطأ في جلب كل الطلبات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const bookingDocRef = doc(db, "bookings", id);
      await updateDoc(bookingDocRef, {
        status: newStatus,
      });
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("خطأ في تحديث الحالة:", err);
    }
  };


  // فلترة الطلبات وترتيبها
  // الأقسام النشطة ترتيب تصاعدي 
  const pendingBookings = bookings.filter((b) => b.status === "pending")
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed")
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

  const readyBookings = bookings.filter((b) => b.status === "ready")
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
  
  // الأقسام المنتهية ترتيب تنازلي
  const completedBookings = bookings.filter((b) => b.status === "completed")
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  if (loading) {
    return (
      <h1 className="text-center text-2xl p-10">جاري تحميل كل الطلبات...</h1>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-second-text mb-8">
        إدارة الطلبات
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-black">لا توجد أي طلبات حالياً.</p>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-4">

          {/* === العمود 1: قيد الانتظار === */}
          <div className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 text-black">
              قيد الانتظار ({pendingBookings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {pendingBookings.length === 0 ? (
                <p className="text-gray-500">لا توجد طلبات</p>
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking}>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                      >
                        قبول (قيد التجهيز)
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                      >
                        رفض
                      </button>
                    </div>
                  </BookingCard>
                ))
              )}
            </div>
          </div>

          {/* === العمود 2: قيد التجهيز === */}
          <div className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 text-black">
              قيد التجهيز ({confirmedBookings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {confirmedBookings.length === 0 ? (
                <p className="text-gray-500">لا توجد طلبات</p>
              ) : (
                confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking}>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, "ready")}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      الطلب جاهز (في الطريق)
                    </button>
                  </BookingCard>
                ))
              )}
            </div>
          </div>

          {/* === العمود 3: في الطريق === */}
          <div className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 text-black">
              في الطريق ({readyBookings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {readyBookings.length === 0 ? (
                <p className="text-gray-500">لا توجد طلبات</p>
              ) : (
                readyBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking}>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, "completed")}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                    >
                      تم التسليم (اكتمل)
                    </button>
                  </BookingCard>
                ))
              )}
            </div>
          </div>

          {/* === العمود 4: مكتمل === */}
          <div className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 text-black">
              مكتمل ({completedBookings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {completedBookings.length === 0 ? (
                <p className="text-gray-500">لا توجد طلبات</p>
              ) : (
                completedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </div>

          {/* === العمود 5: ملغي === */}
          <div className="flex-shrink-0 w-80 bg-gray-100 p-4 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4 text-black">
              ملغي ({cancelledBookings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {cancelledBookings.length === 0 ? (
                <p className="text-gray-500">لا توجد طلبات</p>
              ) : (
                cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default ManageBookingsPage;