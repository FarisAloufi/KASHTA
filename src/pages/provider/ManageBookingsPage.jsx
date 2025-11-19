import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig"; 
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import BookingCard from "../../components/orders/BookingCard"; 
import { 
  LayoutGrid, Clock, ChefHat, Truck, CheckCircle2, XCircle, ChevronDown 
} from "lucide-react";

function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);


  useEffect(() => {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(allBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const orderRef = doc(db, "bookings", bookingId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };


  const getCount = (status) => bookings.filter((b) => b.status === status).length;


  const filteredBookings = activeTab === "all" 
    ? bookings 
    : bookings.filter((b) => b.status === activeTab);


  const tabs = [
    { id: "all", label: "الكل", icon: <LayoutGrid size={18} />, count: bookings.length },
    { id: "pending", label: "قيد الانتظار", icon: <Clock size={18} />, count: getCount("pending") },
    { id: "confirmed", label: "قيد التجهيز", icon: <ChefHat size={18} />, count: getCount("confirmed") },
    { id: "ready", label: "في الطريق", icon: <Truck size={18} />, count: getCount("ready") },
    { id: "completed", label: "مكتملة", icon: <CheckCircle2 size={18} />, count: getCount("completed") },
    { id: "cancelled", label: "ملغية", icon: <XCircle size={18} />, count: getCount("cancelled") },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-second-text">جاري تحميل الطلبات...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">

        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-second-bg/20 pb-6">
          <div className="text-center md:text-right mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-second-text mb-2">
               لوحة تحكم الطلبات
            </h1>
            <p className="text-second-text/70">
              إدارة ومتابعة جميع الحجوزات من مكان واحد.
            </p>
          </div>
          <div className="bg-second-bg text-main-text px-6 py-2 rounded-full font-bold shadow-lg">
            العدد الكلي: {bookings.length}
          </div>
        </div>


        <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold border shadow-sm select-none text-sm md:text-base
                ${activeTab === tab.id 
                  ? "bg-second-bg text-main-text border-second-bg scale-105 shadow-md translate-y-[-2px]" 
                  : "bg-main-bg/40 text-second-bg border-transparent hover:bg-main-bg/60"}
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`
                  text-xs px-2 py-0.5 rounded-full mr-1 ml-1
                  ${activeTab === tab.id ? "bg-main-bg text-secdond-text" : "bg-second-bg text-main-text"}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-second-bg/10 rounded-3xl border-2 border-dashed border-second-bg/20">
              <LayoutGrid size={64} className="mx-auto text-[#d8ceb8ff]/30 mb-4" />
              <h3 className="text-xl font-bold text-second-text/60">لا توجد طلبات في هذه القائمة</h3>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking}>
                

                <div className="mt-4 pt-4">
                  <label className="block text-xs font-bold text-main-text mb-1.5">
                    تحديث الحالة:
                  </label>
                  
                  <div className="relative">
                    <select
                      value={booking.status}
                      disabled={updatingId === booking.id}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`
                        w-full appearance-none bg-second-bg text-main-text font-bold py-3 px-4 rounded-xl 
                        border border-main-bg/20 focus:outline-none focus:ring-2 focus:ring-main-bg transition-all cursor-pointer shadow-sm
                        ${updatingId === booking.id ? "opacity-50 cursor-wait" : "hover:bg-[#c5bbxa]"}
                      `}
                    >
                      <option value="pending">⏳ قيد الانتظار</option>
                      <option value="confirmed">👨‍🍳 قيد التجهيز</option>
                      <option value="ready">🚚 في الطريق</option>
                      <option value="completed">✅ مكتمل</option>
                      <option value="cancelled">❌ ملغي</option>
                    </select>
                    
                    <div className="absolute left-3 top-3.5 pointer-events-none text-main-text/70">
                      {updatingId === booking.id ? (
                        <div className="w-4 h-4 border-2 border-main-bg border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                </div>

              </BookingCard>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default ManageBookingsPage;