import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react"; 
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
    (total, item) => total + (item.servicePrice * item.quantity),
    0,
  );
  

  const totalPieces = cartItems.reduce((total, item) => total + item.quantity, 0);


  const minDate = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

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
      const bookingTimestamp = new Date(bookingDate).toISOString();
      
      for (const item of cartItems) {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          userName: userData?.name || currentUser.email,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          servicePrice: item.servicePrice,
          quantity: item.quantity, 
          bookingDate: bookingTimestamp, 
          location: location,
          status: "pending",
          createdAt: serverTimestamp(),
          rated: false,
        });
      }

      clearCart();
      alert('تم إرسال طلباتك بنجاح! ستجدها في صفحة "طلباتي".');
      navigate("/my-bookings");
    } catch (err) {
      console.error("خطأ في إتمام الطلب:", err);
      setError("حدث خطأ أثناء إرسال الطلبات. الرجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-main-bg min-h-screen py-10 text-second-text">
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-4xl font-extrabold text-light-beige text-center mb-10">
          سلة الحجوزات
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-second-bg text-main-text p-10 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">سلّتك فاضية!</h2>
            <p className="text-lg mb-6">
              شكلك ما اخترت كشتتك للحين. تصفح خدماتنا!
            </p>
            <Link
              to="/services"
              className="bg-black text-white px-8 py-3 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
            >
              تصفح الخدمات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartId}
                  className="bg-second-bg text-main-text p-4 rounded-2xl shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.serviceName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{item.serviceName}</h3>
                      <p className="text-lg font-semibold text-green-700">
                        {item.servicePrice} ريال (للقطعة)
                      </p>
                      
                    
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="bg-gray-200 text-main-text rounded-full w-6 h-6 flex items-center justify-center font-bold disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}
                          className="bg-gray-200 text-main-text rounded-full w-6 h-6 flex items-center justify-center font-bold"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="حذف من السلة"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="bg-second-bg text-main-text p-6 rounded-2xl shadow-lg sticky top-28 space-y-4">
                <h3 className="text-2xl font-bold mb-4 border-b border-main-text/20 pb-2">
                  ملخص السلة
                </h3>
                
            
                <div>
                  <label
                    htmlFor="date"
                    className="block text-main-text font-bold mb-2"
                  >
                    اختر تاريخ ووقت "الكشتة"
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-main-text leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>
            
               
                <div>
                  <label className="block text-main-text font-bold mb-2">
                    حدد موقع الكشتة
                  </label>
                  <MapPicker onLocationChange={setLocation} />
                </div>

                
                <div className="border-t border-main-text/20 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">إجمالي القطع:</span>
                    <span className="text-lg font-bold">{totalPieces}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">الإجمالي:</span>
                    <span className="text-2xl font-extrabold">
                      {totalPrice} ريال
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="bg-red-100 text-red-700 p-3 rounded-xl text-center text-sm">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full max-w-xs bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300 disabled:bg-gray-500"
                >
                  {loading ? "جاري إرسال الطلبات..." : "إتمام الحجز"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;