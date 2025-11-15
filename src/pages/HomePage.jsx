import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, MapPin, Users, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ServiceCard, { StarsReadOnly } from "../components/services/ServiceCard";
import camping from "../assets/camping.jpg"; 

const StatsSection = () => {
  const stats = [
    { icon: Users, value: "2000+", label: "عميل سعيد" },
    { icon: Award, value: "500+", label: "خيمة متاحة" },
    { icon: MapPin, value: "50+", label: "موقع مختلف" },
    { icon: TrendingUp, value: "4.8", label: "تقييم العملاء" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-second-bg/30 transition-all duration-300"
        >
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent-orange" />
          <div className="text-3xl font-black text-second-bg mb-1">
            {stat.value}
          </div>
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
  const { userRole } = useAuth();

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
            ratingsSnapshot.forEach((doc) => {
              totalRating += doc.data().rating;
            });
            const count = ratingsSnapshot.size;
            const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
            return {
              ...service,
              rating: parseFloat(average),
              ratingCount: count,
            };
          }),
        );
        setServices(servicesWithRatings);

        const testimonialsRef = collection(db, "ratings");
        const qTestimonials = query(
          testimonialsRef,
          where("rating", "==", 5),
          orderBy("createdAt", "desc"),
          limit(3),
        );
        const testimonialsSnap = await getDocs(qTestimonials);
        setTestimonials(testimonialsSnap.docs.map((doc) => doc.data()));
      } catch (err) {
        console.error("خطأ في جلب بيانات الصفحة الرئيسية:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteService = async (serviceId) => {
    try {
      const serviceDocRef = doc(db, "services", serviceId);
      await deleteDoc(serviceDocRef);
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== serviceId),
      );
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-brown">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-light-beige">
            جاري تحميل الخدمات...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="relative bg-main-bg text-second-text py-24 md:py-32 overflow-hidden">
         <div className="absolute inset-0">
    <img
      src={camping}
      alt="camping_pic"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/50"></div>
  </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-accent-orange" />
              <span className="font-medium">
                منصة الكشتات الأولى في المملكة
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              جهز كشتتك
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main-accent to-black">
               بخطوة واحدة!
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-light-beige/90 mb-8 leading-relaxed">
              اكتشف أفضل الخيام والمستلزمات واحجزها بضغطة زر
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/services">
                <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
                  استكشف الخدمات
                </button>
              </Link>

              <Link to="/about-us">
                <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
                  كيف يعمل؟
                </button>
              </Link>
            </div>
          </div>
          <StatsSection />
        </div>
      </header>


<section className="bg-main-bg text-second-text py-20 -mt-12 relative z-20 mb-20">
  <div className="container mx-auto px-6">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
        <Award className="w-4 h-4 text-second-text" />
        <span className="text-sm font-bold text-second-text">
          خدمات مميزة
        </span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
        الخدمات المتاحة
      </h2>
      <p className="text-xl text-second-text/70 max-w-2xl mx-auto">
        اختر من بين مجموعة واسعة من الخيام والمخيمات المجهزة بأحدث المرافق
      </p>
    </div>

    {services.length === 0 ? (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-second-bg/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-12 h-12 text-second-text/40" />
        </div>
        <p className="text-xl text-second-text/60">
          لا توجد خدمات متاحة حالياً
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            userRole={userRole}
            onDelete={handleDeleteService}
          />
        ))}
      </div>
    )}
  </div>
</section>

      {testimonials.length > 0 && (
        <section className="bg-main-bg py-20 border-y border-main-text">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
                <Users className="w-4 h-4 text-second-text" />
                <span className="text-sm font-bold text-second-text">
                  آراء العملاء
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
                ماذا يقول عملاؤنا؟
              </h2>
              <p className="text-xl text-second-text">
                تجارب حقيقية من عملاء سعداء
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((review, index) => (
                <div
                  key={index}
                  className="bg-second-bg text-main-text p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-dark-brown/10 hover:-translate-y-1"
                >
                  <div className="mb-4" dir="rtl">
                    <StarsReadOnly rating={review.rating} size={22} />
                  </div>

                  <p className="text-main-text text-lg leading-relaxed mb-6 italic">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-main-accent- rounded-full flex items-center justify-center text-[#3e2723] font-bold text-lg">
                      {review.userName?.charAt(0) || ""}
                    </div>
                    <div className="text-right">
                      <p className="text-dark-brown font-bold text-lg">
                        {review.userName || "عميل"}
                      </p>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-main-bg py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-second-text mb-6">
            جاهز لتجربة لا تُنسى؟
          </h2>
          <p className="text-xl text-second-text/90 mb-8 max-w-2xl mx-auto">
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
