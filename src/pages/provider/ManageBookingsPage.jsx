import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 1. أضفنا getDoc هنا في الاستيرادات العلوية
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs, getDoc
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import BookingCard from "../../components/orders/BookingCard";
import ServiceCard from "../../components/services/ServiceCard";

import {
  LayoutGrid, Clock, ChefHat, Truck, CheckCircle2, XCircle, ChevronDown,
  Package, ShoppingBag, PlusCircle, Loader, AlertCircle
} from "lucide-react";

// --- Configuration ---

const BOOKING_TABS = [
  { id: "all", label: "الكل", icon: LayoutGrid },
  { id: "pending", label: "قيد الانتظار", icon: Clock },
  { id: "confirmed", label: "قيد التجهيز", icon: ChefHat },
  { id: "ready", label: "في الطريق", icon: Truck },
  { id: "completed", label: "مكتملة", icon: CheckCircle2 },
  { id: "cancelled", label: "ملغية", icon: XCircle },
];

// --- Main Component ---

function ManageBookingsPage() {
  const { currentUser, userRole } = useAuth();

  // --- State Management ---
  const [activeSection, setActiveSection] = useState("bookings");
  const [activeBookingTab, setActiveBookingTab] = useState("all");
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // --- Effect 1: Bookings Listener ---
  useEffect(() => {
    if (!currentUser) return;

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fetchedBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Role-Based Logic for Provider
      if (userRole === "provider") {
        fetchedBookings = fetchedBookings
          .filter(booking => {
            const items = booking.items || booking.services || [];
            return items.some(item => item.providerId === currentUser.uid);
          })
          .map(booking => {
            const items = booking.items || booking.services || [];
            const myServices = items.filter(item => item.providerId === currentUser.uid);
            
            const myTotal = myServices.reduce(
              (sum, item) => sum + (Number(item.servicePrice) * Number(item.quantity)), 0
            );

            const myStatus = myServices[0]?.status || 'pending';

            return {
              ...booking,
              services: myServices, // للعرض
              items: myServices,    // للمنطق
              totalPrice: myTotal,
              totalItems: myServices.length,
              status: myStatus 
            };
          });
      }

      setBookings(fetchedBookings);
      setBookingsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // --- Effect 2: Fetch Services ---
  useEffect(() => {
    const fetchServices = async () => {
      if (!currentUser) return;
      
      setServicesLoading(true);
      try {
        const servicesRef = collection(db, "services");
        let q;

        if (userRole === "admin") {
          q = query(servicesRef, orderBy("createdAt", "desc"));
        } else {
          q = query(servicesRef, where("providerId", "==", currentUser.uid), orderBy("createdAt", "desc"));
        }
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    if (activeSection === "services") {
      fetchServices();
    }
  }, [activeSection, currentUser, userRole]);

  // --- Handlers ---

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      // 2. حذفنا السطر الخطأ واستخدمنا getDoc المستوردة في الأعلى
      const docRef = doc(db, "bookings", bookingId);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) return;
      
      const fullBookingData = snapshot.data();
      const allItems = fullBookingData.items || fullBookingData.services || [];

      // Update MY items only
      const updatedItems = allItems.map(item => {
        if (item.providerId === currentUser.uid) {
          return { ...item, status: newStatus };
        }
        return item;
      });

      // Aggregation Check
      const isAllCompleted = updatedItems.every(item => item.status === 'completed');
      const isAllReady = updatedItems.every(item => item.status === 'ready' || item.status === 'completed');

      let newMainStatus = fullBookingData.status;
      if (isAllCompleted) newMainStatus = 'completed';
      else if (isAllReady) newMainStatus = 'ready';
      else newMainStatus = 'pending';

      await updateDoc(docRef, { 
        items: updatedItems,
        services: updatedItems,
        status: newMainStatus 
      });

    } catch (error) {
      console.error("Error updating status:", error);
      alert("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "services", id));
      setServices((prev) => prev.filter((item) => item.id !== id));
      alert("تم حذف الخدمة بنجاح");
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // --- Helpers ---
  const getBookingCount = (status) => bookings.filter((b) => b.status === status).length;
  
  const filteredBookings = activeBookingTab === "all" 
    ? bookings 
    : bookings.filter((b) => b.status === activeBookingTab);

  // --- Render ---

  if (bookingsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">

        <div className="mb-8">
           <div className="flex justify-center bg-second-bg p-1.5 rounded-2xl w-fit mx-auto shadow-lg border border-main-text/10">
              <button 
                onClick={() => setActiveSection("bookings")}
                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all duration-300 ${
                    activeSection === "bookings" ? "bg-main-text text-second-text shadow-md" : "text-main-text/70 hover:bg-main-text/5"
                }`}
              >
                 <ShoppingBag size={20} /> إدارة الطلبات
                 <span className="bg-main-accent/20 text-main-text text-xs px-2 py-0.5 rounded-full ml-1">{bookings.length}</span>
              </button>

              <button 
                onClick={() => setActiveSection("services")}
                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all duration-300 ${
                    activeSection === "services" ? "bg-main-text text-second-text shadow-md" : "text-main-text/70 hover:bg-main-text/5"
                }`}
              >
                 <Package size={20} /> إدارة الخدمات
              </button>
           </div>
        </div>

        {activeSection === "bookings" && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
              {BOOKING_TABS.map((tab) => {
                const count = tab.id === 'all' ? bookings.length : getBookingCount(tab.id);
                return (
                    <button
                    key={tab.id}
                    onClick={() => setActiveBookingTab(tab.id)}
                    className={`
                        flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold border shadow-sm select-none text-sm
                        ${activeBookingTab === tab.id 
                        ? "bg-second-bg text-main-text border-main-text/20 scale-105 shadow-md" 
                        : "bg-main-bg/40 text-second-text border-transparent hover:bg-main-bg/60"}
                    `}
                    >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                    {count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full mr-1 ml-1 ${activeBookingTab === tab.id ? "bg-main-text text-second-text" : "bg-second-text text-main-text"}`}>
                        {count}
                        </span>
                    )}
                    </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.length === 0 ? (
                <div className="col-span-full text-center py-24 bg-second-bg/10 rounded-3xl border-2 border-dashed border-second-text/20">
                  <ShoppingBag size={64} className="mx-auto text-second-text/30 mb-4" />
                  <h3 className="text-xl font-bold text-second-text/60">لا توجد طلبات في هذه القائمة</h3>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking}>
                    
                    {/* ====== 1. عرض تفاصيل المنتجات ====== */}
                    <div className="border-t border-main-text/5 pt-4 mb-4">
                      <p className="text-xs font-bold text-main-text/50 mb-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> الخدمات المطلوبة منك:
                      </p>
                      <div className="space-y-3">
                        {(booking.items || booking.services).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-main-bg/5 p-2 rounded-lg">
                            <img 
                              src={item.imageUrl || "https://placehold.co/50"} 
                              alt={item.serviceName} 
                              className="w-10 h-10 rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-main-text">{item.serviceName}</p>
                              <p className="text-xs text-main-text/60">
                                الكمية: {item.quantity} × {Number(item.servicePrice).toLocaleString()} ريال
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ====== 2. قائمة تحديث الحالة ====== */}
                    <div className="pt-2 border-t border-main-text/10">
                      <label className="block text-xs font-bold text-main-text mb-1.5">تحديث الحالة:</label>
                      <div className="relative">
                        <select
                          value={booking.status}
                          disabled={updatingId === booking.id}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`w-full appearance-none bg-second-bg text-main-text font-bold py-3 px-4 rounded-xl border border-main-text/20 focus:outline-none focus:ring-2 focus:ring-main-text transition-all cursor-pointer shadow-sm ${updatingId === booking.id ? "opacity-50 cursor-wait" : "hover:bg-main-text/5"}`}
                        >
                          <option value="pending">⏳ قيد الانتظار</option>
                          <option value="confirmed">👨‍🍳 قيد التجهيز</option>
                          <option value="ready">🚚 في الطريق</option>
                          <option value="completed">✅ مكتمل</option>
                          <option value="cancelled">❌ ملغي</option>
                        </select>
                        <ChevronDown size={18} className="absolute left-3 top-3.5 pointer-events-none text-main-text/70" />
                      </div>
                    </div>

                  </BookingCard>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "services" && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-second-text">
                   {userRole === "admin" ? "كل خدمات المنصة" : "خدماتي المعروضة"}
                </h2>
                <Link to="/add-service" className="bg-main-accent text-main-text px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition shadow-lg">
                   <PlusCircle size={20} /> إضافة خدمة جديدة
                </Link>
             </div>

             {servicesLoading ? (
                <div className="text-center py-20"><Loader className="animate-spin mx-auto text-second-text" size={32} /></div>
             ) : services.length === 0 ? (
                <div className="text-center py-20 bg-second-bg/10 rounded-3xl border-2 border-dashed border-second-text/20">
                   <Package size={64} className="mx-auto text-second-text/30 mb-4" />
                   <h3 className="text-xl font-bold text-second-text/60">لا توجد خدمات مضافة</h3>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {services.map((service) => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        userRole={userRole} 
                        onDelete={handleDeleteService} 
                      />
                   ))}
                </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ManageBookingsPage;