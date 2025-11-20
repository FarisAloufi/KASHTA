import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, MapPin, Calendar } from "lucide-react";
import MapPicker from "../components/map/MapPicker";

function CartPage() {
  const { cartItems, removeFromCart, clearCart, updateCartItemQuantity } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [bookingDate, setBookingDate] = useState("");

  const totalPrice = cartItems.reduce(
    (total, item) => total + (Number(item.servicePrice) * Number(item.quantity)),
    0,
  );

  const totalPieces = cartItems.reduce((total, item) => total + Number(item.quantity), 0);

  const minDate = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  ).toISOString().slice(0, 16);

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
        services: cartItems.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          servicePrice: Number(item.servicePrice),
          quantity: Number(item.quantity),
          imageUrl: item.imageUrl || "",
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
      console.error("خطأ في إتمام الطلب:", err);
      setError("حدث خطأ أثناء إرسال الطلبات. الرجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2 flex items-center justify-center gap-3">
            <ShoppingBag className="w-10 h-10" />
            سلة الحجوزات
          </h1>
          <p className="text-second-text/70 text-lg">
            راجع طلباتك وأكمل الحجز لرحلة كشتة مميزة
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center bg-second-bg text-main-text p-12 rounded-3xl shadow-lg border border-main-text/10">
            <div className="bg-main-bg/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-main-text/50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">سلّتك فاضية!</h2>
            <p className="text-lg mb-8 text-main-text/70">
              شكلك ما اخترت كشتتك للحين. تصفح خدماتنا واختر ما يناسبك.
            </p>
            <Link
              to="/services"
              className="bg-main-text text-second-text px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:bg-main-accent hover:text-main-text transition-all duration-300 inline-block"
            >
              تصفح الخدمات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


            <div className="lg:col-span-2 space-y-6">
              <div className="bg-second-bg text-main-text p-6 md:p-8 rounded-3xl shadow-lg border border-main-text/10">
                <h2 className="text-2xl font-extrabold mb-6 border-b-2 border-main-text/10 pb-4 flex justify-between items-center">
                  <span>محتويات السلة</span>
                  <span className="text-sm bg-main-text text-second-text px-3 py-1 rounded-full">{cartItems.length} عنصر</span>
                </h2>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-main-text/10 rounded-2xl bg-white/50 hover:shadow-md transition-all duration-300"
                    >

                      <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                        <div className="relative w-24 h-24 shrink-0">
                          <img
                            src={item.imageUrl || "https://placehold.co/100"}
                            alt={item.serviceName}
                            className="w-full h-full rounded-xl object-cover shadow-sm"
                          />
                          {item.type === 'package' && (
                            <span className="absolute -top-2 -right-2 bg-main-accent text-main-text text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              بكج
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-main-text">{item.serviceName}</h3>
                          <p className="text-main-text/60 text-sm font-medium mb-1">سعر الوحدة</p>
                          <p className="text-green-700 font-extrabold text-lg">
                            {Number(item.servicePrice).toLocaleString("ar-SA")} <span className="text-xs text-main-text">ريال</span>
                          </p>
                        </div>
                      </div>


                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-2 sm:mt-0 border-t sm:border-t-0 border-main-text/10 pt-3 sm:pt-0">


                        <div className="flex items-center bg-main-text/10 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-main-accent transition shadow-sm"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>

                          <span className="font-black text-main-text w-8 text-center text-lg">{item.quantity}</span>

                          <button
                            onClick={() => item.quantity <= 1 ? removeFromCart(item.cartId) : updateCartItemQuantity(item.cartId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-main-accent transition shadow-sm"
                          >
                            {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} strokeWidth={3} />}
                          </button>
                        </div>

                        <div className="text-left min-w-[80px]">
                          <p className="text-xs text-main-text/50 font-bold mb-0.5">المجموع</p>
                          <p className="font-black text-xl text-main-text">
                            {(item.servicePrice * item.quantity).toLocaleString("ar-SA")}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-second-bg text-main-text p-6 md:p-8 rounded-3xl shadow-xl border border-main-text/10 sticky top-24">
                <h3 className="text-2xl font-extrabold mb-6 border-b-2 border-main-text/10 pb-4">
                  تفاصيل الحجز
                </h3>

                <div className="space-y-6">

                  <div>
                    <label htmlFor="date" className="block text-main-text font-bold mb-2 flex items-center gap-2">
                      <Calendar size={18} className="text-main-accent" />
                      تاريخ ووقت الكشتة
                    </label>
                    <input
                      type="datetime-local"
                      id="date"
                      className="w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all text-sm font-bold"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={minDate}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-main-text font-bold mb-2 flex items-center gap-2">
                      <MapPin size={18} className="text-main-accent" />
                      موقع الكشتة
                    </label>
                    <div className="border-2 border-main-text/20 rounded-xl overflow-hidden shadow-inner h-48">
                      <MapPicker onLocationChange={setLocation} />
                    </div>
                  </div>


                  <div className="bg-main-bg/5 p-4 rounded-2xl border border-main-text/5 space-y-2">
                    <div className="flex justify-between text-main-text/70 text-sm">
                      <span>عدد الخدمات</span>
                      <span className="font-bold">{totalPieces}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-main-text/10 mt-2">
                      <span className="text-lg font-bold">الإجمالي الكلي</span>
                      <span className="text-2xl font-black text-green-700">
                        {totalPrice.toLocaleString("ar-SA")} <span className="text-sm text-main-text font-medium">ريال</span>
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl text-center text-sm font-bold border border-red-200 flex items-center justify-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-main-text text-second-text py-4 rounded-2xl font-black text-lg shadow-2xl hover:bg-main-accent hover:text-main-text hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "جاري المعالجة..."
                    ) : (
                      <>تأكيد الحجز والدفع</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;