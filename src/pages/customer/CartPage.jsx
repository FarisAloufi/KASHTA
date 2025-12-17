import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, Calendar, ArrowRight, Loader, CheckCircle, ShieldCheck, Clock } from "lucide-react";
import MapPicker from "../../components/map/MapPicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SEO from '../../components/common/SEO';
import { useTranslation } from "react-i18next"; 
import AutoTranslatedText from "../../components/common/AutoTranslatedText";

// --- Sub-Components (CartItemRow) ---

const CartItemRow = ({ item, onUpdateQuantity, onRemove, t }) => {
  const itemTotal = Number(item.servicePrice) * Number(item.quantity);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl border border-main-bg bg-second-bg hover:shadow-md transition-all duration-300">
      <div className="relative w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-sm group">
        <img
          src={item.imageUrl || "https://placehold.co/100"}
          alt={item.serviceName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.type === 'package' && (
          <span className="absolute top-2 right-2 bg-main-accent text-main-text text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {t('cart.package_label')}
          </span>
        )}
      </div>
      <div className="flex-1 text-center md:text-right w-full rtl:text-right ltr:text-left">
        <h3 className="text-lg font-bold text-main-text mb-1">
          <AutoTranslatedText text={item.serviceName} />
        </h3>
        <p className="text-main-text/50 text-xs font-medium">
          {t('cart.unit_price')}: {Number(item.servicePrice).toLocaleString("ar-SA")} {t('services.currency')}
        </p>
      </div>


      <div className="flex items-center bg-second-bg/50 rounded-xl p-1 border border-main-text/5 shadow-inner">
        <button
          onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center bg-white text-main-text rounded-lg hover:bg-main-accent hover:text-second-text transition shadow-sm"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
        <span className="font-black text-main-text w-10 text-center text-lg">{item.quantity}</span>
        <button
          onClick={() => item.quantity <= 1 ? onRemove(item.cartId) : onUpdateQuantity(item.cartId, item.quantity - 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition shadow-sm ${item.quantity === 1 ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white text-main-text hover:bg-main-accent hover:text-second-text'}`}
        >
          {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} strokeWidth={3} />}
        </button>
      </div>

      <div className="text-center md:text-left min-w-[100px] rtl:text-left ltr:text-right">
        <p className="text-xs text-main-text/50 font-bold mb-0.5">{t('cart.total_item')}</p>
        <p className="font-black text-xl text-main-text">
          {itemTotal.toLocaleString("ar-SA")} <span className="text-xs font-normal">{t('services.currency')}</span>
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---

function CartPage() {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const { currentUser, userData, userRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); 

  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);

  const [bookingDate, setBookingDate] = useState(null);

  // Derived Values
  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.servicePrice) * Number(item.quantity)),
    0
  );
  const totalPieces = cartItems.reduce((total, item) => total + Number(item.quantity), 0);
  const minDate = new Date();
  
  // --- Redirects ---
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'provider') {
      navigate("/");
    }
  }, [userRole, navigate]);

  if (userRole === 'admin' || userRole === 'provider') return null;

  // --- Handlers ---

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (userRole === 'admin' || userRole === 'provider') {
      setError(t('cart.error_role'));
      return;
    }

    if (!bookingDate) {
      setError(t('cart.error_date'));
      return;
    }
    if (!location) {
      setError(t('cart.error_location'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newDocRef = doc(collection(db, "bookings"));
      const numericOrderId = Math.floor(10000000 + Math.random() * 90000000).toString();

      const bookingData = {
        orderGroupId: numericOrderId,
        userId: currentUser.uid,
        userName: userData?.name || currentUser.email || t('common.client'),
        items: cartItems.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName, // Store original name (object or string)
          servicePrice: Number(item.servicePrice),
          quantity: Number(item.quantity),
          imageUrl: item.imageUrl || "",
          providerId: item.providerId || "",
          status: 'pending'
        })),
        bookingDate: bookingDate.toISOString(),
        location: location,
        status: 'pending',
        createdAt: serverTimestamp(),
        rated: false,
        totalPrice: Number(totalPrice),
        totalItems: Number(cartItems.length)
      };

      await setDoc(newDocRef, bookingData);

      clearCart();
      navigate("/my-bookings");
    } catch (err) {
      console.error("Checkout Error:", err);
      setError(t('cart.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={t('cart.title')} 
        description={t('cart.description')} 
      />

      <div className="bg-main-bg min-h-screen pt-28 pb-20 px-4 md:px-8 relative">
        <div className="max-w-5xl mx-auto">

          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
            <ArrowRight className="mx-2 rtl:rotate-180" size={20} />
            {t('cart.back')}
          </button>

          <section className="flex justify-center w-full">
            <div className="w-full bg-second-bg rounded-[2.5rem] shadow-2xl overflow-hidden border border-main-bg">

              {/* Header */}
              <div className="bg-main-bg/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-main-text flex items-center gap-3">
                    <span className="bg-main-text text-second-text p-2 rounded-xl">
                      <ShoppingBag size={24} />
                    </span>
                    {t('cart.title')}
                  </h1>
                  <p className="text-main-text/60 text-sm mt-1 mx-1">{t('cart.subtitle')}</p>
                </div>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-500 text-sm font-bold bg-main-bg hover:bg-red-100 px-4 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <Trash2 size={16} /> {t('cart.clear_cart')}
                  </button>
                )}
              </div>

              {/* Empty State */}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="bg-main-bg/50 w-32 h-32 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShoppingBag size={50} className="text-main-text/30" />
                  </div>
                  <h2 className="text-2xl font-black mb-4 text-main-text">{t('cart.empty_title')}</h2>
                  <p className="text-lg mb-8 text-main-text/60 max-w-md">
                    {t('cart.empty_msg')}
                  </p>
                  <Link
                    to="/services"
                    className="group bg-main-text text-second-text px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-main-accent hover:text-main-text transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
                  >
                    {t('cart.browse_services')} <ArrowRight className="group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                  </Link>
                </div>
              ) : (
                // Cart Content
                <div className="p-6 md:p-10">

                  {/* 1. Items List */}
                  <div className="space-y-4 mb-12">
                    {cartItems.map(item => (
                      <CartItemRow
                        key={item.cartId}
                        item={item}
                        onUpdateQuantity={updateCartItemQuantity}
                        onRemove={removeFromCart}
                        t={t} // Pass translation function
                      />
                    ))}
                  </div>

                  {/* 2. Booking Details */}
                  <div className="mb-12">
                    <h2 className="text-2xl font-black text-main-text mb-6 flex items-center gap-2">
                      <span className="bg-main-accent w-1.5 h-8 rounded-full inline-block"></span>
                      {t('cart.trip_details')}
                    </h2>

                    <div className="grid grid-cols-1 gap-6">

                      {/* Date Picker Section - ✅ FIX: Added z-50 to bring it to front */}
                      <div className="bg-main-bg/5 p-6 rounded-[2rem] relative z-50">
                        <label className="text-lg font-bold flex items-center gap-2 text-main-text mb-4">
                          <Clock size={20} className="text-main-accent" />
                          {t('cart.date_label')}
                        </label>

                        <div className="relative w-full rounded-2xl border border-main-bg">
                          <DatePicker
                            selected={bookingDate}
                            onChange={(date) => setBookingDate(date)}
                            showTimeSelect
                            dateFormat="MMMM d, yyyy h:mm aa"
                            minDate={minDate}
                            placeholderText={t('cart.select_date_placeholder')}
                            wrapperClassName="w-full"
                            className="w-full bg-second-bg rounded-2xl px-5 py-4 text-main-text shadow-sm font-bold text-lg outline-none transition-all placeholder:text-main-text/30 cursor-pointer focus:ring-2 focus:ring-main-accent/20"
                            calendarClassName="!font-sans !rounded-2xl !border-0 !shadow-xl !bg-second-bg !text-main-text"
                            dayClassName={() => "!rounded-full hover:!bg-main-accent/20"}
                            timeClassName={() => "!text-main-text hover:!bg-main-accent/20"}
                          />
                        </div>
                      </div>

                      {/* Map Picker - ✅ FIX: Added z-0 to keep it behind date picker */}
                      <div className="bg-main-bg/5 p-2 rounded-[2rem] relative z-0">
                        <div className="p-4 pb-2">
                          <label className="text-lg font-bold flex items-center gap-2 text-main-text">
                            <MapPin size={20} className="text-main-accent" />
                            {t('cart.location_label')}
                          </label>
                          <p className="text-sm text-main-text/60 mt-1">{t('cart.location_hint')}</p>
                        </div>

                        <div className="relative h-80 w-full rounded-3xl overflow-hidden shadow-inner border-4 border-second-bg group">
                          <MapPicker onLocationChange={setLocation} />
                          {!location && (
                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none flex flex-col items-center justify-center text-center p-4">
                              <div className="bg-second-bg/90 backdrop-blur-md p-4 rounded-2xl shadow-xl animate-bounce">
                                <MapPin size={32} className="text-main-accent mx-auto mb-2" />
                                <span className="text-sm font-bold block text-main-text">{t('cart.click_map')}</span>
                              </div>
                            </div>
                          )}
                          {location && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-fade-in">
                              <CheckCircle size={12} /> {t('cart.location_selected')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Summary & Checkout */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-1 shadow-lg mt-8 border border-white/20">
                    <div className="bg-second-bg/80 rounded-[1.8rem] p-6 md:p-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                        <div className="text-center md:text-right rtl:text-right ltr:text-left">
                          <p className="text-main-text/60 text-sm font-bold mb-2">
                            {t('cart.grand_total')} ({totalPieces} {t('cart.items_count')})
                          </p>
                          <div className="flex items-center justify-center md:justify-start rtl:justify-start ltr:justify-start gap-2">
                            <span className="text-5xl font-black text-main-text tracking-tight">{totalPrice.toLocaleString("ar-SA")}</span>
                            <div className="flex flex-col items-start">
                              <span className="text-xl font-bold text-main-accent leading-none">{t('services.currency')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:max-w-md space-y-4">
                          {error && (
                            <div className="bg-red-500/10 text-red-600 p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
                              <ShieldCheck size={18} /> {error}
                            </div>
                          )}

                          <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="group relative w-full bg-main-text text-second-text py-5 px-6 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:bg-main-accent hover:text-main-text transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                          >
                            {loading ? (
                              <><Loader className="animate-spin" size={24} /> {t('cart.processing')}</>
                            ) : (
                              <>
                                <span>{t('cart.confirm_pay')}</span>
                                <CheckCircle size={26} className="group-hover:scale-110 transition-transform" />
                              </>
                            )}
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                          </button>

                          <div className="flex justify-center gap-6 text-main-text/40 text-xs font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><ShieldCheck size={14} /> {t('cart.secure_payment')}</span>
                            <span className="flex items-center gap-1"><Clock size={14} /> {t('cart.instant_support')}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

export default CartPage;