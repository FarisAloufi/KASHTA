import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import BookingCard from '../../components/orders/BookingCard';

function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, orderBy("createdAt", "desc"));
      
      const querySnapshot = await getDocs(q);
      const allBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(allBookings);

    } catch (err) {
      console.error("خطأ في جلب كل الطلبات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const bookingDocRef = doc(db, "bookings", id);
      await updateDoc(bookingDocRef, {
        status: newStatus
      });
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      console.error("خطأ في تحديث الحالة:", err);
    }
  };

  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل كل الطلبات...</h1>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-black mb-8">
        إدارة الطلبات
      </h1>
      
      {bookings.length === 0 ? (
        <p className="text-center text-black">لا توجد أي طلبات حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking.id} booking={booking}>
              
   
              {booking.status === 'pending' && (
                <div className="flex justify-between gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    قبول (قيد التجهيز)
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  >
                    رفض
                  </button>
                </div>
              )}

    
              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => handleUpdateStatus(booking.id, 'ready')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  الطلب جاهز (في الطريق)
                </button>
              )}

           
              {booking.status === 'ready' && (
                <button 
                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                >
                  تم التسليم (اكتمل)
                </button>
              )}

      

            </BookingCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageBookingsPage;