import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import MapDisplay from '../components/map/MapDisplay';
import StatusTracker from '../components/orders/StatusTracker';
import RatingForm from '../components/orders/RatingForm';
import DisplayRating from '../components/orders/DisplayRating';
import { useAuth } from '../context/AuthContext';


const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
const getStatusText = (status) => {
    switch (status) {
    case 'pending':
      return 'قيد الانتظار';
    case 'confirmed':
      return 'قيد التجهيز';
    case 'ready':
      return 'في الطريق';
    case 'completed':
      return 'مكتمل';
    case 'cancelled':
      return 'ملغي';
    default:
      return 'غير معروف';
  }
};



function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userRole } = useAuth(); 


  useEffect(() => {
    setLoading(true);
    setError('');
    const bookingDocRef = doc(db, 'bookings', id);

    const unsubscribe = onSnapshot(bookingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setBooking({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('لم يتم العثور على هذا الطلب.');
      }
      setLoading(false);
    }, (err) => {
      console.error("خطأ في الاستماع للطلب:", err);
      setError('حدث خطأ في جلب البيانات.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل الطلب...</h1>;
  }
  if (error) {
    return <h1 className="text-center text-2xl p-10 text-red-600">{error}</h1>;
  }
  if (!booking) {
    return null;
  }

  const bookingDate = new Date(booking.bookingDate).toLocaleString('ar-SA', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-[#d8ceb8ff] p-6 rounded-lg shadow-lg">
        
 
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{booking.serviceName}</h1>
            <p className="text-2xl text-green-700 font-bold mt-2">
              {booking.servicePrice} ريال
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>
        
        <hr className="my-6" />

        {/* متتبع الحالة */}
        <div className="mb-6">
          <StatusTracker status={booking.status} />
        </div>

        <hr className="my-6" />

        {/* تفاصيل الوقت والموقع */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-700 text-lg">تاريخ ووقت "الكشتة"</h3>
            <p className="text-gray-600 text-lg">{bookingDate}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-700 text-lg">الموقع المحدد</h3>
          </div>
        </div>

        {/* الخريطة */}
        <div className="w-full h-80 rounded-lg overflow-hidden border">
          <MapDisplay location={booking.location} />
        </div>

        {/* === منطق التقييم (كما كان) === */}
        {userRole === 'customer' && (
          <>
            {booking.status === 'completed' && !booking.rated && (
              <RatingForm booking={booking} />
            )}
            {booking.status === 'completed' && booking.rated && (
              <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
                <p className="text-center text-xl font-bold text-green-600">
                  👍 شكراً لك! تقييمك وصل.
                </p>
                <p className="text-center text-gray-600 mt-2">
                  تقييمك يساعدنا نطور الخدمة وننبسط!
                </p>
              </div>
            )}
          </>
        )}

        {userRole === 'provider' && (
          <>
            {booking.rated && (
              <DisplayRating bookingId={booking.id} />
            )}
            {!booking.rated && (
              <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
                <p className="text-center text-gray-500 font-medium">بانتظار تقييم العميل...</p>
              </div>
            )}
          </>
        )}
        
      </div>
    </div>
  );
}

export default BookingDetailPage;