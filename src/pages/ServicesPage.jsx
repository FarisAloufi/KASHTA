import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import { Link } from 'react-router-dom'; 
import { Star, Award, MapPin } from 'lucide-react';

const StarsReadOnly = ({ rating, size = 16 }) => {
    return (
        <div className="flex gap-0.5" dir="rtl">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <Star
                        key={ratingValue}
                        fill={ratingValue <= rating ? "#ffc107" : "none"} 
                        stroke={ratingValue <= rating ? "#ffc107" : "#3e2723"}
                        size={size}
                        className="transition-all"
                    />
                );
            })}
        </div>
    );
};


const HomeServiceCard = ({ service }) => {
    return (
   
        <div className="group relative bg-[#d8ceb8ff] text-[#3e2723] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-dark-brown/10">
            <Link to={`/service/${service.id}`}>
            <div className="relative h-64 overflow-hidden">
                <img 
                    src={service.imageUrl || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {service.rating >= 4.5 && (
                    <div className="absolute top-4 right-4 bg-accent-orange text-[#3e2723] px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                        <Award size={14} />
                        <span>الأفضل</span>
                    </div>
                )}
            </div>
            </Link>
            <div className="p-6">
                <h3 className="text-2xl font-bold text-[#3e2723] mb-3 group-hover:text-accent-orange transition-colors">
                    {service.name}
                </h3>
                                
                <div className="flex items-center gap-3 mb-4" dir="rtl">
                    <StarsReadOnly rating={service.rating} size={18} />
                    <span className="text-lg font-bold text-[#3e2723]">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.ratingCount} تقييم)</span>
                </div>
                
                <div className="flex justify-between items-center pt-5 border-t border-dark-brown/10">
                    <div>
                        <div className="text-sm text-dark-brown/70 mb-1">السعر يبدأ من</div>
                        <span className="text-3xl font-black text-dark-brown">
                            {service.price} ريال
                        </span>
                    </div>
                    
                    
                    <Link 
                        to={`/service/${service.id}`}
                        className="bg-black text-white px-7 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
                    >
                        احجز الآن
                    </Link>
                </div>
            </div>
        </div>
    );
};


function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchServices = async () => {
      try {
        const servicesCollectionRef = collection(db, "services"); 
        const data = await getDocs(query(servicesCollectionRef)); 
        const servicesData = data.docs.map((doc) => ({
          ...doc.data(), 
          id: doc.id,
          rating: 0, 
          ratingCount: 0,
        }));
        
        const servicesWithRatings = await Promise.all(
            servicesData.map(async (service) => {
                const ratingsRef = collection(db, "ratings");
                const q = query(ratingsRef, where("serviceId", "==", service.id));
                const ratingsSnapshot = await getDocs(q);
                let totalRating = 0;
                ratingsSnapshot.forEach(doc => { totalRating += doc.data().rating; });
                const count = ratingsSnapshot.size;
                const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
                return { ...service, rating: parseFloat(average), ratingCount: count };
            })
        );
        setServices(servicesWithRatings);
      } catch (err)
      {
        console.error("خطأ في جلب الخدمات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kashta-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kashta-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-light-beige">جاري تحميل الخدمات...</h1>
        </div>
      </div>
    );
  }

  return (
  
    <div className="bg-kashta-bg min-h-screen">
      <section className="bg-kashta-beige text-kashta-brown container mx-auto px-6 py-20 rounded-t-3xl shadow-xl mt-12 relative z-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-kashta-brown/10 px-4 py-2 rounded-full mb-4">
            <Award className="w-4 h-4 text-kashta-brown" />
            <span className="text-sm font-bold text-kashta-brown">خدمات مميزة</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-kashta-brown mb-4">
            جميع الخدمات
          </h2>
          <p className="text-xl text-kashta-brown/70 max-w-2xl mx-auto">
            اختر من بين مجموعة واسعة من الخيام والمخيمات المجهزة بأحدث المرافق
          </p>
        </div>
                
        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-kashta-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-kashta-brown/40" />
            </div>
            <p className="text-xl text-kashta-brown/60">لا توجد خدمات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <HomeServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ServicesPage;