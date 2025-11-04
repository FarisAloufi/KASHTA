import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
// 1. استيراد onSnapshot (المستمع) بدلاً من getDocs
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/orders/BookingCard';

function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. سنستخدم useEffect للاستماع
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // 3. بناء الاستعلام (Query) كما كان
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, 
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    // 4. *** هذا هو التغيير الأهم ***
    // (onSnapshot) بدلاً من (getDocs)
    // (onSnapshot) تُرجع دالة (unsubscribe) لإيقاف الاستماع
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // (هذا الكود سيعمل تلقائياً كلما حدث تغيير في قاعدة البيانات)
      const userBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookings(userBookings);
      setLoading(false);
      console.log("تحديث تلقائي: تم جلب الطلبات!", userBookings);

    }, (err) => {
      // 5. التعامل مع الأخطاء
      console.error("خطأ في الاستماع للطلبات:", err);
      setLoading(false);
    });

    // 6. دالة "التنظيف" (Cleanup)
    // عند إغلاق الصفحة، يجب أن نوقف الاستماع لتوفير الموارد
    return () => {
      console.log("إيقاف الاستماع للطلبات");
      unsubscribe();
    };

  }, [currentUser]); // إعادة تشغيل الاستماع إذا تغير المستخدم

  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل طلباتك...</h1>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-black mb-8">
        طلباتي
      </h1>
      
      {bookings.length === 0 ? (
        <p className="text-center text-black">لا يوجد لديك أي طلبات سابقة.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;