import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/firebaseConfig";

import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import BookingCard from "../components/orders/BookingCard";

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userBookings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBookings(userBookings);
        setLoading(false);
        console.log("تحديث تلقائي: تم جلب الطلبات!", userBookings);
      },
      (err) => {
        console.error("خطأ في الاستماع للطلبات:", err);
        setLoading(false);
      },
    );

    return () => {
      console.log("إيقاف الاستماع للطلبات");
      unsubscribe();
    };
  }, [currentUser]);

  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل طلباتك...</h1>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-second-text mb-8">طلباتي</h1>

      {bookings.length === 0 ? (
        <p className="text-center text-second-text">لا يوجد لديك أي طلبات سابقة.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
