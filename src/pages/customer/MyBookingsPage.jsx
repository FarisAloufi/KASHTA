import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next"; 
import { useCustomerBookings } from "../../hooks/useCustomerBookings"; 
import BookingCard from "../../components/orders/BookingCard";
import {
  LayoutGrid, Clock, ChefHat, Truck, CheckCircle2, XCircle, ShoppingBag, Loader
} from "lucide-react";
import SEO from '../../components/common/SEO'; 

// --- Main Component ---

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const { bookings, loading } = useCustomerBookings(currentUser?.uid);
  
  // State for Tabs
  const [activeTab, setActiveTab] = useState("all");

  // --- Filtering Logic ---
  const getBookingCount = (status) => bookings.filter((b) => b.status === status).length;

  const filteredBookings = activeTab === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  // ✅ Tabs Configuration
  const BOOKING_TABS = [
    { id: "all", label: t('my_bookings.tab_all'), icon: LayoutGrid },
    { id: "pending", label: t('my_bookings.tab_pending'), icon: Clock },
    { id: "confirmed", label: t('my_bookings.tab_confirmed'), icon: ChefHat },
    { id: "ready", label: t('my_bookings.tab_ready'), icon: Truck },
    { id: "completed", label: t('my_bookings.tab_completed'), icon: CheckCircle2 },
    { id: "cancelled", label: t('my_bookings.tab_cancelled'), icon: XCircle },
  ];

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="w-12 h-12 text-second-text animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-second-text">{t('common.loading')}</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={t('my_bookings.page_title')} 
        description={t('my_bookings.page_subtitle')} 
      />

      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">

          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-second-text flex items-center gap-3">
              <ShoppingBag size={36} className="text-main-accent" />
              {t('my_bookings.page_title')}
            </h1>
            <p className="text-second-text mt-1 font-medium">{t('my_bookings.page_subtitle')}</p>
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
                      ? "bg-second-bg text-main-text border-main-bg scale-105 shadow-md"
                      : "bg-main-bg/40 text-second-text border-transparent hover:bg-main-bg/60"}
                  `}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mx-1 ${activeTab === tab.id ? "bg-main-text text-second-text" : "bg-second-text text-main-text"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bookings Grid */}
          {bookings.length === 0 ? (
            <div className="text-center bg-second-bg text-main-text p-16 rounded-3xl shadow-lg border border-main-bg mt-10">
              <ShoppingBag size={64} className="mx-auto text-main-text/20 mb-6" />
              <h2 className="text-2xl font-black mb-4">{t('my_bookings.no_bookings_title')}</h2>
              <p className="text-lg text-main-text/70 mb-8 max-w-md mx-auto">
                {t('my_bookings.no_bookings_desc')}
              </p>
            </div>
          ) : (
            <>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-24 bg-second-bg/10 rounded-3xl border-2 border-dashed border-main-bg">
                  <ShoppingBag size={48} className="mx-auto text-second-text/30 mb-4" />
                  <h3 className="text-xl font-bold text-second-text/60">{t('my_bookings.empty_filter')}</h3>
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
    </>
  );
}

export default MyBookingsPage;