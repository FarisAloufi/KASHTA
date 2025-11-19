import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import BookingCard from "../components/orders/BookingCard";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(bookingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-second-text">جاري تحميل الطلبات...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-10">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-second-text text-center mb-10">
          طلباتي
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center bg-second-bg text-main-text p-10 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">ما عندك طلبات!</h2>
            <p className="text-lg mb-6">
              ابدأ بحجز أول كشتة لك واستمتع بتجربة فريدة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;