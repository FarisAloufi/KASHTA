import React, { useState } from "react";
import { Link } from "react-router-dom";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useProviderBookings } from "../../hooks/useProviderBookings";
import { useProviderServices } from "../../hooks/useProviderServices";
import { updateBookingItemStatus } from "../../services/bookingService";
import { showSuccess, showError, showLoading, dismissToast } from "../../utils/customToast";
// --- Components ---
import BookingCard from "../../components/orders/BookingCard";
import ServiceCard from "../../components/services/ServiceCard";
import SEO from '../../components/common/SEO';
// ✅ استيراد المكون للتعامل مع الأسماء المترجمة تلقائياً
import AutoTranslatedText from "../../components/common/AutoTranslatedText";

// --- Icons ---
import {
  LayoutGrid, Clock, ChefHat, Truck, CheckCircle2, XCircle, ChevronDown,
  Package, ShoppingBag, PlusCircle, Loader, AlertTriangle
} from "lucide-react";

function ManageBookingsPage() {
  const { currentUser, userRole } = useAuth();
  // ✅ 1. استخراج i18n هنا لاستخدامه لاحقاً
  const { t, i18n } = useTranslation();

  // --- Configuration ---
  const BOOKING_TABS = [
    { id: "all", label: t('manage.tab_all'), icon: LayoutGrid },
    { id: "pending", label: t('status.pending'), icon: Clock },
    { id: "confirmed", label: t('status.confirmed'), icon: ChefHat },
    { id: "ready", label: t('status.ready'), icon: Truck },
    { id: "completed", label: t('status.completed'), icon: CheckCircle2 },
    { id: "cancelled", label: t('status.cancelled'), icon: XCircle },
  ];

  // --- UI State ---
  const [activeSection, setActiveSection] = useState("bookings");
  const [activeBookingTab, setActiveBookingTab] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // --- Cancel Modal State ---
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // --- Data Hooks ---
  const { bookings, loading: bookingsLoading, setBookings } = useProviderBookings(userRole, currentUser?.uid);
  const { services, loading: servicesLoading, setServices } = useProviderServices(activeSection, userRole, currentUser?.uid);

  // --- Handlers ---

  const handleStatusChange = async (bookingId, newStatus) => {
    if (newStatus === 'cancelled') {
      setSelectedBookingId(bookingId);
      setCancelModalOpen(true);
      return;
    }
    await processStatusUpdate(bookingId, newStatus);
  };

  const processStatusUpdate = async (bookingId, newStatus, reason = null) => {
    setUpdatingId(bookingId);
    showLoading(t('manage.updating_status') || 'جاري تحديث الحالة...');
    try {
      const { updatedItems, newMainStatus } = await updateBookingItemStatus(
        bookingId, 
        currentUser.uid, 
        userRole, 
        newStatus,
        reason 
      );

      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId 
            ? { 
                ...b, 
                items: updatedItems, 
                services: updatedItems, 
                status: newMainStatus,
                cancellationReason: reason || b.cancellationReason 
              } 
            : b
        )
      );
      dismissToast('loading-toast');
      showSuccess(t('manage.update_success') || 'تم تحديث حالة الطلب بنجاح!');
    } catch (error) {
      console.error(error);
      dismissToast('loading-toast');
      showError(t('manage.error_updating') || 'حدث خطأ أثناء التحديث، حاول مرة أخرى.');
    } finally {
      setUpdatingId(null);
      setCancelModalOpen(false); 
      setCancellationReason(""); 
    }
  };


  const confirmCancellation = () => {
    if (!cancellationReason.trim()) {
      alert("الرجاء كتابة سبب الإلغاء");
      return;
    }
    processStatusUpdate(selectedBookingId, "cancelled", cancellationReason);
  };

  const handleDeleteItem = async (id) => {
    const itemToDelete = services.find(item => item.id === id);
    if (!itemToDelete) return;

    const isPackage = itemToDelete.type === "package";
    const collectionName = isPackage ? "packages" : "services";

    if (!window.confirm(t('manage.confirm_delete'))) return;
    showLoading('جاري حذف العنصر...');

    try {
      await deleteDoc(doc(db, collectionName, id));
      setServices((prev) => prev.filter((item) => item.id !== id));
      dismissToast('loading-toast');
      showSuccess(t('manage.delete_success') || 'تم حذف الخدمة بنجاح.');
    } catch (error) {
      console.error("Error deleting item:", error);
      dismissToast('loading-toast');
      showError(t('manage.delete_error') || 'فشل الحذف، حاول مرة أخرى.');
    }
  };

  const getBookingCount = (status) => bookings.filter((b) => b.status === status).length;
  const filteredBookings = activeBookingTab === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeBookingTab);

  if (bookingsLoading && activeSection === 'bookings') {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  const pageTitle = activeSection === 'services' ? t('manage.services_btn') : t('manage.orders_btn');

  return (
    <>
      <SEO title={pageTitle} description="إدارة حجوزاتك وخدماتك بسهولة عبر منصة كشتة." />

      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-second-bg p-6 rounded-2xl shadow-2xl max-w-md w-full border border-main-bg animate-fade-in">
            <div className="text-center mb-4">
              <div className="bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-main-text">تأكيد إلغاء الطلب</h3>
              <p className="text-sm text-main-text/60 mt-1">يجب ذكر سبب الإلغاء ليظهر للعميل.</p>
            </div>
            
            <textarea
              className="w-full bg-main-bg/5 border-2 border-main-bg/20 rounded-xl p-3 text-main-text focus:border-red-500 focus:ring-0 outline-none h-32 resize-none mb-4"
              placeholder="اكتب سبب الإلغاء هنا..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={confirmCancellation}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition"
              >
                تأكيد الإلغاء
              </button>
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-main-bg min-h-screen py-24 px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">

          {/* Top Navigation */}
          <div className="mb-8">
            <div className="flex justify-center bg-second-bg p-1.5 rounded-2xl w-fit mx-auto shadow-lg border border-main-bg">
              <button
                onClick={() => setActiveSection("bookings")}
                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all duration-300 ${activeSection === "bookings" ? "bg-main-text text-second-text shadow-md" : "text-main-text/70 hover:bg-main-text/5"}`}
              >
                <ShoppingBag size={20} /> {t('manage.orders_btn')}
                <span className="bg-main-accent/20 text-main-text text-xs px-2 py-0.5 rounded-full ml-1">{bookings.length}</span>
              </button>

              <button
                onClick={() => setActiveSection("services")}
                className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all duration-300 ${activeSection === "services" ? "bg-main-text text-second-text shadow-md" : "text-main-text/70 hover:bg-main-text/5"}`}
              >
                <Package size={20} /> {t('manage.services_btn')}
              </button>
            </div>
          </div>

          {/* Bookings Section */}
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
                          ? "bg-second-bg text-main-text border-main-bg scale-105 shadow-md"
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
                  <div className="col-span-full text-center py-24 bg-second-bg/10 rounded-3xl border-2 border-dashed border-main-bg">
                    <ShoppingBag size={64} className="mx-auto text-second-text mb-4" />
                    <h3 className="text-xl font-bold text-second-text">{t('manage.no_orders')}</h3>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking}>
                      
                      {/* Items Details */}
                      <div className="pt-4 mb-4">
                        <p className="text-xs font-bold text-main-text/50 mb-2 flex items-center gap-1">
                          <CheckCircle2 size={12} /> {t('manage.required_items')}:
                        </p>
                        <div className="space-y-3">
                          {(booking.items || booking.services).map((item, idx) => {
                            // ✅ استخدام AutoTranslatedText هنا هو الحل الأفضل، أو استخدام i18n.language
                            const itemName = typeof item.serviceName === 'object'
                              ? (item.serviceName[i18n.language] || item.serviceName['en']) // ✅ استخدام i18n المتغير من الأعلى
                              : item.serviceName;

                            return (
                              <div key={idx} className="flex items-center gap-3 bg-main-bg/5 p-2 rounded-lg">
                                <img
                                  src={item.imageUrl || "https://placehold.co/50"}
                                  alt={String(itemName)}
                                  className="w-10 h-10 rounded-md object-cover"
                                />
                                <div className="flex-1">
                                  {/* استخدمنا AutoTranslatedText للضمان */}
                                  <p className="text-sm font-bold text-main-text">
                                     <AutoTranslatedText text={item.serviceName} />
                                  </p>
                                  <p className="text-xs text-main-text/60">
                                    {t('booking_detail.quantity')}: {item.quantity} × {Number(item.servicePrice).toLocaleString()} {t('services.currency')}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status Dropdown */}
                      <div className="pt-2 border-t border-main-bg">
                        <label className="block text-xs font-bold text-main-text mb-1.5">{t('manage.update_status')}:</label>
                        <div className="relative">
                          <select
                            value={booking.status}
                            disabled={updatingId === booking.id}
                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                            className={`w-full appearance-none bg-second-bg text-main-text font-bold py-3 px-4 rounded-xl border border-main-bg focus:outline-none focus:ring-2 focus:ring-main-text transition-all cursor-pointer shadow-sm ${updatingId === booking.id ? "opacity-50 cursor-wait" : "hover:bg-main-text/5"}`}
                          >
                            <option value="pending">⏳ {t('status.pending')}</option>
                            <option value="confirmed">👨‍🍳 {t('status.confirmed')}</option>
                            <option value="ready">🚚 {t('status.ready')}</option>
                            <option value="completed">✅ {t('status.completed')}</option>
                            <option value="cancelled">❌ {t('status.cancelled')}</option>
                          </select>
                          <ChevronDown size={18} className="absolute left-3 top-3.5 pointer-events-none text-main-text/70 rtl:right-auto rtl:left-3" />
                        </div>
                      </div>

                    </BookingCard>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Services Section */}
          {activeSection === "services" && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-second-text">
                  {userRole === "admin" ? t('manage.all_services_admin') : t('manage.my_services')}
                </h2>
                <Link to="/add-service" className="bg-main-accent text-main-text px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition shadow-lg">
                  <PlusCircle size={20} /> {t('navbar.add_service')}
                </Link>
              </div>

              {servicesLoading ? (
                <div className="text-center py-20"><Loader className="animate-spin mx-auto text-second-text" size={32} /></div>
              ) : services.length === 0 ? (
                <div className="text-center py-20 bg-second-bg/10 rounded-3xl border-2 border-dashed border-second-bg">
                  <Package size={64} className="mx-auto text-second-text mb-4" />
                  <h3 className="text-xl font-bold text-second-text">{t('manage.no_services')}</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.map((item) => (
                    <ServiceCard
                      key={item.id}
                      service={item}
                      userRole={userRole}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default ManageBookingsPage;