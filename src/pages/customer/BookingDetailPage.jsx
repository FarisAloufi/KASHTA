import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import MapDisplay from "../../components/map/MapDisplay";
import StatusTracker from "../../components/orders/StatusTracker";
import RatingForm from "../../components/orders/RatingForm";
import DisplayRating from "../../components/orders/DisplayRating";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { User, MapPin, Calendar, Hash, ShoppingBag, CreditCard, Clock, CheckCircle2, Truck, ChefHat, XCircle, AlertTriangle } from "lucide-react";
import SEO from '../../components/common/SEO'; 
import { translateText } from "../../utils/googleTranslate";
import AutoTranslatedText from "../../components/common/AutoTranslatedText";

// --- Sub-Components ---

const BookingHeader = ({ id, status, userName }) => {
  const { t } = useTranslation();

  const STATUS_CONFIG = {
    pending: { color: "bg-amber-100 text-amber-800 border border-amber-200", text: t('status.pending') },
    confirmed: { color: "bg-blue-100 text-blue-800 border border-blue-200", text: t('status.confirmed') },
    ready: { color: "bg-emerald-100 text-emerald-800 border border-emerald-200", text: t('status.ready') },
    completed: { color: "bg-gray-100 text-gray-800 border border-gray-200", text: t('status.completed') },
    cancelled: { color: "bg-red-100 text-red-800 border border-red-200", text: t('status.cancelled') },
    default: { color: "bg-gray-100 text-gray-800 border border-gray-200", text: t('status.unknown') }
  };

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.default;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b-2 border-dashed border-main-bg pb-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-main-bg text-second-bg p-2 rounded-lg shadow-sm">
            <Hash size={24} />
          </span>
          <div>
            <p className="text-xs text-main-text/60 font-bold">{t('booking_detail.order_number')}</p>
            <h1 className="text-3xl font-black text-main-text font-mono tracking-wide">{id}</h1>
          </div>
        </div>
        <span className={`inline-block px-5 py-2 rounded-xl text-sm font-bold shadow-sm ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      <div className="w-full md:w-auto bg-main-bg/5 p-5 rounded-3xl min-w-[240px]">
        <p className="text-xs text-main-text/40 font-bold mb-3 uppercase tracking-wider">{t('booking_detail.customer_info')}</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-main-text text-second-text rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/10">
            <User size={22} />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-main-text line-clamp-1">{userName || t('common.client')}</span>
            <span className="text-xs text-main-text/60 bg-main-bg/10 px-2 py-0.5 rounded-md">{t('booking_detail.verified_client')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesList = ({ services, totalPrice }) => {
  const { t, i18n } = useTranslation();
  const getItemStatusConfig = (status) => {
    switch (status) {
      case 'ready': return { icon: Truck, text: t('status.ready_delivery'), color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'completed': return { icon: CheckCircle2, text: t('status.delivered'), color: 'bg-green-50 text-green-700 border-green-200' };
      case 'confirmed': return { icon: ChefHat, text: t('status.preparing'), color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'cancelled': return { icon: XCircle, text: t('status.cancelled'), color: 'bg-red-50 text-red-700 border-red-200' };
      default: return { icon: Clock, text: t('status.pending'), color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="bg-main-bg/5 rounded-3xl p-6 mb-8">
      <h3 className="font-extrabold text-main-text text-xl mb-6 flex items-center gap-2">
        <ShoppingBag className="text-main-text" />
        {t('booking_detail.requested_services')}
        <span className="bg-second-bg text-main-text text-xs px-2.5 py-1 rounded-full shadow-sm border border-main-bg">{services.length}</span>
      </h3>

      <div className="space-y-4">
        {services.map((item, index) => {
          const itemStatus = getItemStatusConfig(item.status || 'pending');
          const StatusIcon = itemStatus.icon;
          
          // نستخدم الاسم الخام هنا لنمرره للمكون الذكي
          const rawName = item.serviceName || item.name;

          return (
            <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-second-bg p-4 rounded-2xl shadow-sm border border-main-bg hover:shadow-md transition-shadow gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                )}

                <div className="flex flex-col gap-1">
                  <p className="font-bold text-main-text text-lg">
                    <AutoTranslatedText text={rawName} />
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <p className="text-sm text-main-text/50 font-medium bg-main-bg/10 px-2 py-0.5 rounded-lg w-fit">{t('booking_detail.quantity')}: {item.quantity}</p>
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold border ${itemStatus.color}`}>
                      <StatusIcon size={12} />
                      {itemStatus.text}
                    </span>
                  </div>
                </div>
              </div>

              <span className="font-black text-main-text text-xl bg-main-bg/5 px-4 py-2 rounded-xl self-end sm:self-center flex items-center gap-1">
                {(Number(item.servicePrice || item.price) * Number(item.quantity || 1)).toLocaleString(i18n.language === 'ar' ? "ar-SA" : "en-US")} <span className="text-xs">{t('services.currency')}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t-2 border-dashed border-main-bg">
        <div className="flex items-center gap-2 text-main-text/60 font-bold text-lg mb-2 sm:mb-0">
          <CreditCard size={24} /> {t('booking_detail.final_total')}
        </div>
        <span className="text-4xl font-black text-green-700 tracking-tight flex items-center gap-2">
          {Number(totalPrice).toLocaleString(i18n.language === 'ar' ? "ar-SA" : "en-US")} <span className="text-lg text-main-text font-bold">{t('services.currency')}</span>
        </span>
      </div>
    </div>
  );
};

// --- Main Page ---

function BookingDetailPage() {
  const { id } = useParams();
  const { userRole, currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [mainBooking, setMainBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translatedReason, setTranslatedReason] = useState("");

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
          let bookingData = {
            id: querySnapshot.docs[0].id,
            ...docData
          };

          const allItems = bookingData.items || bookingData.services || [];
          if (userRole === "provider" && currentUser) {
            const myItems = allItems.filter(item => item.providerId === currentUser.uid);
            const myTotal = myItems.reduce(
              (sum, item) => sum + (Number(item.servicePrice) * Number(item.quantity)), 0
            );
            bookingData.services = myItems;
            bookingData.totalPrice = myTotal;
          } else {
            bookingData.services = allItems;
          }

          setMainBooking(bookingData);
        } else {
          setError(t('booking_detail.not_found'));
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to booking:", err);
        setError(t('booking_detail.fetch_error'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id, userRole, currentUser, t]);

  useEffect(() => {
    if (mainBooking?.cancellationReason && mainBooking.status === "cancelled") {
      if (currentLang === 'en') {
        translateText(mainBooking.cancellationReason, 'en')
          .then(res => setTranslatedReason(res));
      } else {
        setTranslatedReason(mainBooking.cancellationReason);
      }
    }
  }, [mainBooking, currentLang]);


  const seoTitle = `${t('booking_detail.order_number')} #${id}`;

  const bookingDateFormatted = mainBooking 
    ? new Date(mainBooking.bookingDate).toLocaleString(i18n.language === 'ar' ? "ar-SA" : "en-US", { dateStyle: "full", timeStyle: "short" })
    : "";

  return (
    <>
      <SEO 
        title={seoTitle}
        description={`تفاصيل وحالة الطلب رقم ${id} في منصة كشتة.`} 
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-main-bg">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-main-bg border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-bold text-main-text/60">{t('common.loading')}...</h1>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
           <h1 className="text-2xl font-bold text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100">{error}</h1>
        </div>
      ) : mainBooking ? (
        <div className="bg-main-bg min-h-screen py-24 px-4 md:px-8">
          <div className="container mx-auto max-w-5xl">

            <div className="bg-second-bg text-main-text p-8 rounded-[2.5rem] shadow-2xl">

              <BookingHeader
                id={id}
                status={mainBooking.status}
                userName={mainBooking.userName}
              />

              {mainBooking.status === "cancelled" && mainBooking.cancellationReason && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-3xl p-6 animate-fade-in">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full shrink-0 shadow-sm">
                       <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-800 text-lg mb-1">{t('booking_detail.order_cancelled_title')}</h3>
                      <p className="text-red-700/80 leading-relaxed font-medium">
                        <span className="font-bold text-red-900">{t('booking_detail.reason_label')}:</span> {translatedReason || mainBooking.cancellationReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-10 bg-second-bg p-6 rounded-3xl ">
                <StatusTracker status={mainBooking.status} />
              </div>

              <ServicesList
                services={mainBooking.services || []}
                totalPrice={mainBooking.totalPrice || 0}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-second-bg p-6 rounded-3xl border border-main-bg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-main-text text-sm mb-3 flex items-center gap-2 uppercase tracking-wider opacity-70">
                    <Calendar size={18} className="text-main-accent" /> {t('booking_detail.booking_date')}
                  </h3>
                  <p className="text-main-text font-black text-xl" dir="ltr">{bookingDateFormatted}</p>
                </div>

                <div className="bg-second-bg p-6 rounded-3xl border border-main-bg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-main-text text-sm mb-3 flex items-center gap-2 uppercase tracking-wider opacity-70">
                    <MapPin size={18} className="text-main-accent" /> {t('booking_detail.location')}
                  </h3>
                  <div className="h-48 rounded-2xl overflow-hidden border border-main-bg shadow-inner relative group">
                    <MapDisplay location={mainBooking.location} />
                    <div className="absolute inset-0 border-4 border-transparent group-hover:border-main-accent/20 rounded-2xl transition-colors pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {userRole === "customer" && (
                <>
                  {mainBooking.status === "completed" && !mainBooking.rated && (
                    <RatingForm booking={mainBooking} />
                  )}
                  {mainBooking.status === "completed" && mainBooking.rated && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mt-8">
                      <p className="text-xl font-bold text-green-700 flex items-center justify-center gap-2">
                        <CheckCircle2 size={24} /> {t('booking_detail.rating_received')}
                      </p>
                    </div>
                  )}
                </>
              )}

              {userRole === "provider" && (
                <>
                  {mainBooking.rated && <DisplayRating bookingId={mainBooking.id} />}
                  {!mainBooking.rated && (
                    <div className="text-center py-8 bg-main-bg/5 rounded-2xl border-2 border-dashed border-main-bg mt-8">
                      <p className="text-main-text/50 font-bold flex items-center justify-center gap-2">
                        <Clock size={20} /> {t('booking_detail.waiting_rating')}
                      </p>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default BookingDetailPage;