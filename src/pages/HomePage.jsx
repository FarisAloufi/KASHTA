import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig'; 
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'; 
import { Link } from 'react-router-dom'; 
import { Star, Sparkles, TrendingUp, MapPin, Users, Award } from 'lucide-react'; 


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
                    <span className="text-sm text-[#3e2723]">({service.ratingCount} تقييم)</span>
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


const StatsSection = () => {
    const stats = [
        { icon: Users, value: "2000+", label: "عميل سعيد" },
        { icon: Award, value: "500+", label: "خيمة متاحة" },
        { icon: MapPin, value: "50+", label: "موقع مختلف" },
        { icon: TrendingUp, value: "4.8", label: "تقييم العملاء" }
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent-orange" />
                    <div className="text-3xl font-black text-light-beige mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

function HomePage() {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
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

    
        const testimonialsRef = collection(db, "ratings");
        const qTestimonials = query(testimonialsRef, 
            where("rating", "==", 5), 
            orderBy("createdAt", "desc"), 
            limit(3)
        );
        const testimonialsSnap = await getDocs(qTestimonials);
        setTestimonials(testimonialsSnap.docs.map(doc => doc.data()));

      } catch (err) {
        console.error("خطأ في جلب بيانات الصفحة الرئيسية:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-brown">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-light-beige">جاري تحميل الخدمات...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
  
      <header className="relative bg-dark-brown text-light-beige py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-accent-orange" />
              <span className="text-sm font-medium">منصة الكشتات الأولى في المملكة</span>
            </div>
                        
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              جهز كشتتك
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-orange-300">
                بخطوة واحدة!
              </span>
            </h1>
                        
            <p className="text-xl md:text-2xl text-light-beige/90 mb-8 leading-relaxed">
              اكتشف أفضل الخيام والمستلزمات واحجزها بضغطة زر
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
          
              <Link to="/services"><button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
                استكشف الخدمات
              </button>
              </Link>

              <Link to="/about-us" >
              <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
                كيف يعمل؟
              </button>
              </Link>
            </div>
          </div>
          <StatsSection />
        </div>
        
       
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#d8ceb8ff"/>
          </svg>
        </div>
      </header>
      
     
      <section className="bg-light-beige container mx-auto px-6 py-20 rounded-t-3xl shadow-xl -mt-12 relative z-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-dark-brown/10 px-4 py-2 rounded-full mb-4">
            <Award className="w-4 h-4 text-dark-brown" />
            <span className="text-sm font-bold text-dark-brown">خدمات مميزة</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-dark-brown mb-4">
            الخدمات المتاحة
          </h2>
          <p className="text-xl text-dark-brown/70 max-w-2xl mx-auto">
            اختر من بين مجموعة واسعة من الخيام والمخيمات المجهزة بأحدث المرافق
          </p>
        </div>
                
        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-[#d8ceb8ff] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-[#3e2723]" />
            </div>
            <p className="text-xl text-dark-brown/60">لا توجد خدمات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <HomeServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
      
    
      {testimonials.length > 0 && (
        <section className="bg-dark-brown py-20 border-y border-dark-brown/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-light-beige/10 px-4 py-2 rounded-full mb-4 shadow-sm">
                <Users className="w-4 h-4 text-light-beige" />
                <span className="text-sm font-bold text-light-beige">آراء العملاء</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-light-beige mb-4">
                ماذا يقول عملاؤنا؟
              </h2>
              <p className="text-xl text-light-beige/70">
                تجارب حقيقية من عملاء سعداء
              </p>
            </div>
                        
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((review, index) => (
              
                <div key={index} className="bg-[#d8ceb8ff] text-[#3e2723] p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-dark-brown/10 hover:-translate-y-1">
                  <div className="mb-4" dir="rtl">
                    <StarsReadOnly rating={review.rating} size={22} />
                  </div>
                  
                  <p className="text-[#3e2723] text-lg leading-relaxed mb-6 italic">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-orange rounded-full flex items-center justify-center text-[#3e2723] font-bold text-lg">
                      {review.userName?.charAt(0) || 'ع'}
                    </div>
                    <div className="text-right">
                      <p className="text-dark-brown font-bold text-lg">
                        {review.userName || 'عميل'}
                      </p>
                      <p className="text-gray-600 text-sm">عميل معتمد</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
     
      <section className="bg-light-beige py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-dark-brown mb-6">
            جاهز لتجربة لا تُنسى؟
          </h2>
          <p className="text-xl text-dark-brown/90 mb-8 max-w-2xl mx-auto">
            احجز خيمتك اليوم واستمتع بأفضل تجربة كشتة مع عائلتك وأصدقائك
          </p>
         
         <Link to="/services">
          <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
            ابدأ الحجز الآن
          </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;