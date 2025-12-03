import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import BookingCard from "../components/orders/BookingCard";
import {
  LayoutGrid, Clock, ChefHat, Truck, CheckCircle2, XCircle, ShoppingBag, Loader
} from "lucide-react";

// --- Configuration ---

// Tabs configuration for filtering bookings
const BOOKING_TABS = [
  { id: "all", label: "الكل", icon: LayoutGrid },
  { id: "pending", label: "قيد الانتظار", icon: Clock },
  { id: "confirmed", label: "قيد التجهيز", icon: ChefHat },
  { id: "ready", label: "في الطريق", icon: Truck },
  { id: "completed", label: "مكتملة", icon: CheckCircle2 },
  { id: "cancelled", label: "ملغية", icon: XCircle },
];

// --- Main Component ---

function MyBookingsPage() {
  const { currentUser } = useAuth();

  // State Management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Real-time Data Fetching
  useEffect(() => {
    if (!currentUser) return;

    // Query bookings where userId matches current user
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

  // --- Filtering Logic ---

  const getBookingCount = (status) => bookings.filter((b) => b.status === status).length;

  const filteredBookings = activeTab === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="w-12 h-12 text-second-text animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-second-text">جاري تحميل طلباتك...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-second-text flex items-center gap-3">
            <ShoppingBag size={36} className="text-main-accent" />
            طلباتي السابقة
          </h1>
          <p className="text-second-text/70 mt-1">تتبع حالة طلباتك واستعرض تاريخ كشتاتك</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
          {BOOKING_TABS.map((tab) => {
            const count = tab.id === 'all' ? bookings.length : getBookingCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold border shadow-sm select-none text-sm
                  ${activeTab === tab.id
                    ? "bg-second-bg text-main-text border-main-text/20 scale-105 shadow-md"
                    : "bg-main-bg/40 text-second-text border-transparent hover:bg-main-bg/60"}
                `}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full mr-1 ml-1 ${activeTab === tab.id ? "bg-main-text text-second-text" : "bg-second-text text-main-text"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="text-center bg-second-bg text-main-text p-16 rounded-3xl shadow-lg border border-main-text/5 mt-10">
            <ShoppingBag size={64} className="mx-auto text-main-text/20 mb-6" />
            <h2 className="text-2xl font-black mb-4">ما عندك طلبات للآن!</h2>
            <p className="text-lg text-main-text/70 mb-8 max-w-md mx-auto">
              ابدأ رحلتك الأولى معنا، احجز خيمتك واستمتع بتجربة لا تُنسى.
            </p>
          </div>
        ) : (
          <>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-24 bg-second-bg/10 rounded-3xl border-2 border-dashed border-second-text/20">
                <ShoppingBag size={48} className="mx-auto text-second-text/30 mb-4" />
                <h3 className="text-xl font-bold text-second-text/60">لا توجد طلبات في هذه القائمة</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default MyBookingsPage;