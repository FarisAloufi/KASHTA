import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // (أيقونة الحذف)

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. حساب الإجمالي
  const totalPrice = cartItems.reduce((total, item) => total + item.servicePrice, 0);

  // 2. دالة إرسال الطلب (تحويل السلة إلى طلبات حقيقية)
  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // 3. المرور على كل عنصر في السلة وحفظه كـ "طلب" منفصل
      for (const item of cartItems) {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          userName: userData?.name || currentUser.email,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          servicePrice: item.servicePrice,
          bookingDate: item.bookingDate,
          location: item.location,
          status: 'pending', 
          createdAt: serverTimestamp(),
          rated: false,
        });
      }

      // 4. بعد النجاح: تفريغ السلة وتوجيه العميل
      clearCart();
      alert('تم إرسال طلباتك بنجاح! ستجدها في صفحة "طلباتي".');
      navigate('/my-bookings');

    } catch (err) {
      console.error("خطأ في إتمام الطلب:", err);
      setError('حدث خطأ أثناء إرسال الطلبات. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 5. *** تطبيق التصميم (خلفية بنية، بطاقات بيج) ***
    <div className="bg-kashta-bg min-h-screen py-10 text-light-beige">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-light-beige text-center mb-10">
          سلة الحجوزات
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-[#d8ceb8ff] text-[#3e2723] p-10 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">سلّتك فاضية!</h2>
            <p className="text-lg mb-6">شكلك ما اخترت كشتتك للحين. تصفح خدماتنا!</p>
            <Link 
              to="/services" 
              className="bg-[#3e2723] text-white px-8 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-black transition-all"
            >
              تصفح الخدمات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 6. *** قائمة الطلبات (في اليمين) *** */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.cartId} className="bg-[#d8ceb8ff] text-[#3e2723] p-4 rounded-2xl shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.serviceName} 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{item.serviceName}</h3>
                      <p className="text-lg font-semibold text-green-700">{item.servicePrice} ريال</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.bookingDate).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
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

            {/* 7. *** ملخص الطلب (في اليسار) *** */}
            <div className="md:col-span-1">
              <div className="bg-[#d8ceb8ff] text-[#3e2723] p-6 rounded-2xl shadow-lg sticky top-28">
                <h3 className="text-2xl font-bold mb-4 border-b border-[#3e2723]/20 pb-2">ملخص السلة</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg">عدد الخدمات:</span>
                  <span className="text-lg font-bold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold">الإجمالي:</span>
                  <span className="text-2xl font-extrabold">{totalPrice} ريال</span>
                </div>
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-center text-sm">{error}</p>}

                <button 
                  onClick={handleCheckout} 
                  disabled={loading}
                  className="bg-[#3e2723] text-white w-full py-3 rounded-xl font-bold text-lg shadow-md hover:bg-black transition disabled:bg-gray-400"
                >
                  {loading ? 'جاري إرسال الطلبات...' : 'إتمام الحجز'}
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