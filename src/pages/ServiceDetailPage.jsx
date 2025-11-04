import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig'; // (تم حذف auth)
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // (تم حذف addDoc و serverTimestamp)
import MapPicker from '../components/map/MapPicker';
import { FaStar } from 'react-icons/fa'; 
import { subscribeToAverageRating } from '../services/ratingService'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // 1. *** استيراد (useCart) ***
// (نفترض أن هذه المكونات موجودة)
import RatingForm from '../components/orders/RatingForm';
import DisplayRating from '../components/orders/DisplayRating';

// (مكون النجوم كما كان)
const StarsReadOnly = ({ rating, size = 20 }) => {
    return (
        <div className="flex space-x-1 space-x-reverse">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <FaStar
                        key={ratingValue}
                        color={ratingValue <= rating ? "#ffc107" : "#3e2723"}
                        stroke={ratingValue <= rating ? "#ffc107" : "#3e2723"}
                        fill={ratingValue <= rating ? "#ffc107" : "none"}
                        size={size}
                    />
                );
            })}
        </div>
    );
};


function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { addToCart } = useCart(); // 2. *** جلب دالة (addToCart) ***
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States للحجز
  const [bookingDate, setBookingDate] = useState('');
  const [location, setLocation] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false); // (يمكنك إزالتها إذا أردت)
  
  // States للميزات الجديدة
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 }); 
  const [individualRatings, setIndividualRatings] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);

  // ... (useEffect لجلب البيانات - كما كان) ...
  useEffect(() => {
    setLoading(true);
    const fetchServiceAndRatings = async () => {
      try {
        const serviceDocRef = doc(db, 'services', id);
        const docSnap = await getDoc(serviceDocRef);

        if (docSnap.exists()) {
          const serviceData = { id: docSnap.id, ...docSnap.data() };
          setService(serviceData);
          
          const ratingsRef = collection(db, 'ratings');
          const ratingsQuery = query(ratingsRef, where('serviceId', '==', id), orderBy('createdAt', 'desc'));
          const ratingsSnap = await getDocs(ratingsQuery);
          setIndividualRatings(ratingsSnap.docs.map(d => ({id: d.id, ...d.data()})));

          const similarQuery = query(collection(db, 'services'), where('price', '<=', serviceData.price + 50), where('price', '>=', serviceData.price - 50));
          const similarSnap = await getDocs(similarQuery);
          setSimilarServices(similarSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => s.id !== id).slice(0, 3));
        } else {
          setError('لم يتم العثور على هذه الخدمة.');
        }
      } catch (err) {
        console.error("خطأ في جلب الخدمة:", err);
        setError('حدث خطأ في جلب بيانات الخدمة.');
      }
      setLoading(false);
    };
    fetchServiceAndRatings();
    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
        setAverageRating(data);
    });
    return () => {
        unsubscribeRating();
    };
  }, [id]); 


  // 3. *** تعديل دالة الحجز لتصبح (إضافة للسلة) ***
  const handleAddToCart = (e) => {
    e.preventDefault();
    setBookingError('');
    
    if (!currentUser) {
      setBookingError('يجب عليك تسجيل الدخول أولاً لإضافة خدمات للسلة.');
      setTimeout(() => navigate('/login'), 1500); 
      return;
    }
    
    if (userRole !== 'customer') {
        setBookingError('فقط العملاء يمكنهم الإضافة للسلة.');
        return;
    }

    if (!bookingDate || !location) {
      setBookingError('الرجاء اختيار تاريخ ووقت وموقع الحجز على الخريطة.');
      return;
    }
    
    // 4. *** تجهيز المنتج للإضافة ***
    const itemToAdd = {
        // (بيانات الخدمة)
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        imageUrl: service.imageUrl, // (لنعرض الصورة في السلة)
        // (بيانات الحجز)
        bookingDate: new Date(bookingDate).toISOString(), 
        location: location,
    };

    // 5. *** الإضافة للسلة والانتقال لصفحة السلة ***
    addToCart(itemToAdd);
    navigate('/cart'); // (الانتقال لصفحة السلة)
  };


  if (loading) {
    return <h1 className="text-center text-2xl p-10 text-light-beige">جاري تحميل الخدمة...</h1>; 
  }
  if (error) {
    return <h1 className="text-center text-2xl p-10 text-red-400">{error}</h1>;
  }
  if (!service) { return null; }

  const minDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);


  return (
    <div className="bg-kashta-bg min-h-screen py-10 text-light-beige">
      <div className="container mx-auto p-6 max-w-4xl space-y-12">
          
          {/* === القسم 1: الصورة والمعلومات الأساسية === */}
          <section className="bg-[#d8ceb8ff] text-[#3e2723] p-6 rounded-2xl shadow-xl border border-dark-brown/10">
              <h1 className="text-4xl font-extrabold text-[#3e2723] mb-3">{service.name}</h1>
              <div className="flex items-center space-x-2 space-x-reverse mb-6">
                  <StarsReadOnly rating={averageRating.average} size={24} />
                  <span className="text-2xl font-bold text-[#e48a4e]">{averageRating.average}</span>
                  <span className="text-lg text-gray-500">({averageRating.count} تقييم)</span>
              </div>
              <img 
                  src={service.imageUrl} 
                  alt={service.name} 
                  className="w-full h-96 object-cover rounded-xl shadow-lg mb-6" 
              />
              <div className="bg-kashta-brown/10 p-4 rounded-xl mb-6 text-center font-bold text-[#3e2723]">
                  <p className="text-3xl">السعر: {service.price} ريال / الليلة</p>
              </div>
              <h3 className="text-2xl font-bold text-[#3e2723] mt-6 mb-3 border-b border-dark-brown/20 pb-2">تفاصيل الخدمة</h3>
              <p className="text-[#3e2723] text-lg whitespace-pre-wrap">{service.description || "لا يوجد وصف متوفر حالياً."}</p>
          </section>

          {/* === القسم 2: نموذج الإضافة للسلة === */}
          <section className="bg-[#d8ceb8ff] text-[#3e2723] p-6 rounded-2xl shadow-2xl border-2 border-[#3e2723]" id="booking-section">
              <h2 className="text-3xl font-extrabold text-center mb-6 text-[#3e2723]">
                  إضافة للسلة
              </h2>
              
              {bookingError && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">{bookingError}</p>}

              {/* 6. *** ربط الفورم بـ handleAddToCart *** */}
              <form onSubmit={handleAddToCart} className="space-y-4">
                
                <div>
                  <label htmlFor="date" className="block text-[#3e2723] font-bold mb-2">
                    اختر تاريخ ووقت "الكشتة"
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-[#3e2723] leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#3e2723] font-bold mb-2">
                    حدد الموقع على الخريطة
                  </label>
                  <MapPicker onLocationChange={setLocation} />
                </div>

                {/* 7. *** تغيير نص الزر *** */}
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl text-xl transition shadow-lg disabled:bg-gray-400"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'جاري الإضافة...' : 'أضف إلى السلة'}
                </button>
              </form>
          </section>

          <hr className="border-t-2 border-light-beige/20" />

          {/* === القسم 3: خدمات قد تعجبك === */}
          {similarServices.length > 0 && (
            <section className="bg-[#d8ceb8ff] text-[#3e2723] p-6 rounded-2xl shadow-xl border border-dark-brown/10">
                <h3 className="text-3xl font-extrabold text-[#3e2723] mb-6">خدمات قد تعجبك</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarServices.map(simService => (
                        <Link key={simService.id} to={`/service/${simService.id}`} className="block border rounded-lg hover:shadow-lg transition bg-white">
                            <img src={simService.imageUrl} alt={simService.name} className="w-full h-40 object-cover rounded-t-lg" />
                            <div className="p-3">
                                <p className="text-[#3e2723] font-bold">{simService.name}</p>
                                <p className="text-[#e48a4e] font-bold">{simService.price} ر.س</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
          )}

          <hr className="border-t-2 border-light-beige/20" />

          {/* === القسم 4: آراء العملاء === */}
          <section className="bg-[#d8ceb8ff] text-[#3e2723] p-6 rounded-2xl shadow-xl border border-dark-brown/10">
              <h3 className="text-3xl font-extrabold text-[#3e2723] mb-6">آراء العملاء ({averageRating.count})</h3>
              <div className="space-y-6">
                  {individualRatings.length > 0 ? (
                      individualRatings.map((rating) => (
                          <div key={rating.id} className="border-b border-dark-brown/20 py-4 last:border-b-0">
                              <div className="flex justify-between">
                                  <StarsReadOnly rating={rating.rating} size={18} />
                                  <p className="text-sm text-gray-500">
                                      {rating.createdAt ? new Date(rating.createdAt.toDate()).toLocaleDateString('ar-SA') : '...'}
                                  </p>
                              </div>
                              <p className="text-[#3e2723] italic text-lg my-2">"{rating.comment}"</p>
                              <p className="text-sm text-gray-600 font-medium">
                                  - {rating.userName || 'عميل'}
                              </p>
                          </div>
                      ))
                  ) : (
                      <p className="text-gray-500 text-center py-5">كن أول من يقيّم هذه الخدمة!</p>
                  )}
              </div>
          </section>
      </div>
    </div>
  );
}

export default ServiceDetailPage;