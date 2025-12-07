import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, Calendar, ArrowRight, Loader, CheckCircle, ShieldCheck, Clock } from "lucide-react";
import MapPicker from "../components/map/MapPicker";

// --- Sub-Components ---

/**
 * Renders a single row for a cart item with image, details, and controls.
 */
const CartItemRow = ({ item, onUpdateQuantity, onRemove }) => {
  const itemTotal = Number(item.servicePrice) * Number(item.quantity);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl border border-main-text/5 bg-main-bg/5 hover:border-main-accent/30 transition-colors">

      {/* Product Image */}
      <div className="relative w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-sm group">
        <img
          src={item.imageUrl || "https://placehold.co/100"}
          alt={item.serviceName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.type === 'package' && (
          <span className="absolute top-2 right-2 bg-main-accent text-main-text text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            بكج
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 text-center md:text-right w-full">
        <h3 className="text-lg font-bold text-main-text mb-1">{item.serviceName}</h3>
        <p className="text-main-text/50 text-xs font-medium">
          سعر الوحدة: {Number(item.servicePrice).toLocaleString("ar-SA")} ريال
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center bg-white/50 rounded-xl p-1 border border-main-text/5 shadow-inner">
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

      {/* Item Total */}
      <div className="text-center md:text-left min-w-[100px]">
        <p className="text-xs text-main-text/50 font-bold mb-0.5">المجموع</p>
        <p className="font-black text-xl text-main-text">
          {itemTotal.toLocaleString("ar-SA")} <span className="text-xs font-normal">ريال</span>
        </p>
      </div>
    </div>
  );
};

// --- Main Component ---

function CartPage() {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [bookingDate, setBookingDate] = useState("");

  // Derived Values
  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.servicePrice) * Number(item.quantity)),
    0
  );
  const totalPieces = cartItems.reduce((total, item) => total + Number(item.quantity), 0);
  const minDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  // --- Handlers ---

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!bookingDate) {
      setError("الرجاء اختيار تاريخ ووقت الكشتة.");
      return;
    }
    if (!location) {
      setError("الرجاء تحديد موقع توصيل الكشتة على الخريطة.");
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
        userName: userData?.name || currentUser.email || "عميل",
        items: cartItems.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          servicePrice: Number(item.servicePrice),
          quantity: Number(item.quantity),
          imageUrl: item.imageUrl || "",
          providerId: item.providerId || "",
          status: 'pending' 
        })),
        bookingDate: new Date(bookingDate).toISOString(),
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
      setError("حدث خطأ أثناء إرسال الطلبات. الرجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  return (
    <div className="bg-main-bg min-h-screen pt-28 pb-20 px-4 md:px-8 relative">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
          <ArrowRight className="ml-2" size={20} />
          العودة للخلف
        </button>

        <section className="flex justify-center w-full">
          <div className="w-full bg-second-bg rounded-3xl shadow-xl overflow-hidden border border-main-text/5">

            {/* Header */}
            <div className="bg-main-bg/5 p-6 md:p-8 border-b border-main-text/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-main-text flex items-center gap-3">
                  <ShoppingBag className="text-main-accent" size={32} />
                  سلة الحجوزات
                </h1>
                <p className="text-main-text/60 text-sm mt-1 mr-1">راجع طلباتك وأكمل بيانات الحجز</p>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-500 text-sm font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition flex items-center gap-2"
                >
                  <Trash2 size={16} /> إفراغ السلة
                </button>
              )}
            </div>

            {/* Empty State */}
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="bg-main-bg/50 w-32 h-32 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <ShoppingBag size={50} className="text-main-text/30" />
                </div>
                <h2 className="text-2xl font-black mb-4">سلّتك فاضية!</h2>
                <p className="text-lg mb-8 text-main-text/60 max-w-md">
                  شكلك ما اخترت كشتتك للحين. تصفح خدماتنا واختر ما يناسب جوك.
                </p>
                <Link
                  to="/services"
                  className="group bg-main-text text-second-text px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-main-accent hover:text-main-text transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
                >
                  تصفح الخدمات <ArrowRight className="group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              // Cart Content
              <div className="p-6 md:p-10">

                {/* 1. Items List */}
                <div className="space-y-6 mb-12">
                  {cartItems.map(item => (
                    <CartItemRow
                      key={item.cartId}
                      item={item}
                      onUpdateQuantity={updateCartItemQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>

                <div className="h-px bg-main-text/10 my-10" />

                {/* 2. Booking Details */}
                <div className="mb-12">
                  <h2 className="text-2xl font-black text-main-text mb-6 flex items-center gap-2">
                    <span className="bg-main-accent w-2 h-8 rounded-full inline-block"></span>
                    تفاصيل الرحلة
                  </h2>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Date Picker */}
                    <div className="bg-main-bg/5 p-6 rounded-2xl border border-main-text/5">
                      <label className="text-lg font-bold flex items-center gap-2 text-main-text mb-4">
                        <Clock size={20} className="text-main-accent" />
                        موعد الكشتة
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          className="w-full bg-second-bg border-2 border-transparent focus:border-main-accent rounded-xl px-5 py-4 text-main-text shadow-sm font-bold text-lg outline-none transition-all"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={minDate}
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-main-text/30 pointer-events-none" size={20} />
                      </div>
                    </div>

                    {/* Map Picker */}
                    <div className="bg-main-bg/5 p-2 rounded-3xl border border-main-text/5">
                      <div className="p-4 pb-2">
                        <label className="text-lg font-bold flex items-center gap-2 text-main-text">
                          <MapPin size={20} className="text-main-accent" />
                          موقع التخييم
                        </label>
                        <p className="text-sm text-main-text/60 mt-1">يرجى تحديد نقطة التجمع أو مكان الكشتة بدقة على الخريطة</p>
                      </div>

                      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-lg border-4 border-second-bg group">
                        <MapPicker onLocationChange={setLocation} />
                        {!location && (
                          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-second-bg/90 backdrop-blur-md p-4 rounded-2xl shadow-xl animate-bounce">
                              <MapPin size={32} className="text-main-accent mx-auto mb-2" />
                              <span className="text-sm font-bold block text-main-text">اضغط هنا لتحديد الموقع</span>
                            </div>
                          </div>
                        )}
                        {location && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-fade-in">
                            <CheckCircle size={12} /> تم تحديد الموقع
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Summary & Checkout */}
                <div className="bg-gradient-to-br from-main-text/5 to-main-accent/10 rounded-3xl p-1 shadow-lg mt-8">
                  <div className="bg-second-bg rounded-[22px] p-6 md:p-10 border border-main-text/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                      <div className="text-center md:text-right">
                        <p className="text-main-text/60 text-sm font-bold mb-2">الإجمالي الكلي ({totalPieces} خدمات)</p>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="text-5xl font-black text-main-text tracking-tight">{totalPrice.toLocaleString("ar-SA")}</span>
                          <div className="flex flex-col items-start">
                            <span className="text-xl font-bold text-main-accent leading-none">ريال</span>
                            <span className="text-xs text-main-text/50 font-bold">سعودي</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:max-w-md space-y-4">
                        {error && (
                          <div className="bg-red-500/10 text-red-600 p-4 rounded-xl text-center text-sm font-bold border border-red-500/20 flex items-center justify-center gap-2 animate-pulse">
                            <ShieldCheck size={18} /> {error}
                          </div>
                        )}

                        <button
                          onClick={handleCheckout}
                          disabled={loading}
                          className="group relative w-full bg-main-text text-second-text py-5 px-6 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl hover:shadow-main-text/20 hover:bg-main-accent hover:text-main-text transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden"
                        >
                          {loading ? (
                            <><Loader className="animate-spin" size={24} /> جاري المعالجة...</>
                          ) : (
                            <>
                              <span>تأكيد الحجز والدفع</span>
                              <CheckCircle size={26} className="group-hover:scale-110 transition-transform" />
                            </>
                          )}
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                        </button>

                        <div className="flex justify-center gap-6 text-main-text/40 text-xs font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><ShieldCheck size={14} /> دفع آمن</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> دعم فوري</span>
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
  );
}

export default CartPage;