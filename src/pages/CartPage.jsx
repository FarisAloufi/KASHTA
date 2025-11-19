import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
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
    (total, item) => total + (Number(item.servicePrice) * Number(item.quantity)),
    0,
  );
  

  const totalPieces = cartItems.reduce((total, item) => total + Number(item.quantity), 0);


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
      const newDocRef = doc(collection(db, "bookings"));
      

      const bookingData = {
        orderGroupId: newDocRef.id, 
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
    <div className="bg-main-bg min-h-screen py-10">
      <div className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-4xl font-extrabold text-second-text text-center mb-10">
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
              className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
            >
              تصفح الخدمات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-second-bg text-main-text p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 border-b border-main-bg/20 pb-2">
                  طلبك الحالي 
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex items-center justify-between p-4 border border-main-bg/10 rounded-xl bg-main-bg/5"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={item.imageUrl}
                          alt={item.serviceName}
                          className="w-16 h-16 rounded-lg object-cover border border-main-bg/20"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{item.serviceName}</h3>
                          <p className="text-green-700 font-semibold">
                            {Number(item.servicePrice).toLocaleString("ar-SA")} ريال (للقطعة)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateCartItemQuantity(item.cartId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="bg-main-bg/10 text-main-bg rounded-full w-8 h-8 flex items-center justify-center font-bold disabled:opacity-50 hover:bg-main-bg/20 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateCartItemQuantity(item.cartId, item.quantity + 1)}
                            className="bg-main-bg/10 text-main-text rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-main-bg/20 transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-20">
                          <p className="font-bold text-lg">
                            {(item.servicePrice * item.quantity).toLocaleString("ar-SA")} ريال
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-red-600 hover:text-red-800 transition p-2 bg-red-100 rounded-full"
                          title="حذف من السلة"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-main-bg/20 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span>إجمالي القطع:</span>
                    <span className="font-bold">{totalPieces}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl mt-2">
                    <span className="font-bold">المجموع الكلي:</span>
                    <span className="font-extrabold text-2xl text-green-800">
                      {totalPrice.toLocaleString("ar-SA")} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>


            <div className="md:col-span-1">
              <div className="bg-second-bg text-main-text p-6 rounded-2xl shadow-lg sticky top-28 space-y-4">
                <h3 className="text-2xl font-bold mb-4 border-b border-main-bg/20 pb-2">
                  تفاصيل الحجز
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
                    className="shadow appearance-none border border-main-bg/20 rounded-xl w-full py-3 px-4 text-main-text bg-white/50 leading-tight focus:outline-none focus:ring-2 focus:ring-main-bg transition"
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
                  <div className="border-2 border-main-bg/20 rounded-xl overflow-hidden">
                    <MapPicker onLocationChange={setLocation} />
                  </div>
                </div>

                {error && (
                  <p className="bg-red-100 text-red-700 p-3 rounded-xl text-center text-sm font-medium border border-red-200">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
                >
                  {loading ? "جاري إرسال الطلب..." : "تأكيد الحجز والدفع"}
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