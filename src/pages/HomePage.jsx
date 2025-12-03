import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Sparkles, TrendingUp, MapPin, Users, Award, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ServiceCard, { StarsReadOnly } from "../components/services/ServiceCard";
import camping from "../assets/camping.jpg";

// --- Constants & Configuration ---
const SITE_RATING_ID = "GENERAL_SITE_RATING";

// Static data for the statistics section (Moved outside to prevent re-creation on render)
const STATS_DATA = [
  { icon: Users, value: "2000+", label: "عميل سعيد" },
  { icon: Award, value: "500+", label: "خيمة متاحة" },
  { icon: MapPin, value: "50+", label: "موقع مختلف" },
  { icon: TrendingUp, value: "4.8", label: "تقييم العملاء" },
];

/**
 * Helper function to calculate average rating from a snapshot
 * @param {Object} ratingsSnapshot - Firestore snapshot of ratings
 * @returns {Object} { average: number, count: number }
 */
const calculateAverageRating = (ratingsSnapshot) => {
  let totalRating = 0;
  let validRatingsCount = 0;

  ratingsSnapshot.forEach((doc) => {
    const r = doc.data().rating;
    if (r && r > 0) {
      totalRating += r;
      validRatingsCount++;
    }
  });

  const average = validRatingsCount > 0 ? (totalRating / validRatingsCount).toFixed(1) : 0;
  return { average: parseFloat(average), count: validRatingsCount };
};

// --- Sub-Components ---

const StatsSection = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      {STATS_DATA.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-second-bg/30 transition-all duration-300"
        >
          <stat.icon className="w-8 h-8 mx-auto mb-3 text-main-accent" />
          <div className="text-3xl font-black text-second-bg mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-200">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

// --- Main Component ---

function HomePage() {
  // State Management
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth Context
  const { userRole } = useAuth();

  // Fetch Data Effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Prepare queries
        const servicesQuery = query(collection(db, "services"), limit(6));
        const testimonialsQuery = query(
          collection(db, "ratings"),
          where("rating", "==", 5),
          where("serviceId", "==", SITE_RATING_ID),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        // 2. Fetch both services and testimonials in parallel
        const [servicesSnapshot, testimonialsSnapshot] = await Promise.all([
          getDocs(servicesQuery),
          getDocs(testimonialsQuery)
        ]);

        // 3. Process Services Data
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // 4. Calculate Ratings for each service (N+1 query pattern - kept as per logic requirements)
        const servicesWithRatings = await Promise.all(
          servicesData.map(async (service) => {
            const ratingsRef = collection(db, "ratings");
            const q = query(ratingsRef, where("serviceId", "==", service.id));
            const ratingsSnapshot = await getDocs(q);

            const { average, count } = calculateAverageRating(ratingsSnapshot);

            return {
              ...service,
              rating: average,
              ratingCount: count,
            };
          })
        );

        // 5. Update State
        setServices(servicesWithRatings);
        setTestimonials(testimonialsSnapshot.docs.map((doc) => doc.data()));

      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Service Deletion
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    try {
      const serviceDocRef = doc(db, "services", serviceId);
      await deleteDoc(serviceDocRef);
      // Optimistic update: remove from UI immediately
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error("Error removing service: ", error);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="animate-spin text-second-text mx-auto mb-4" size={48} />
          <p className="text-second-text">جاري التحميل ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* === Hero Section === */}
      <header className="relative bg-main-bg text-second-text py-24 md:py-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <img
            src={camping}
            alt="Camping Scenery"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-main-accent" />
              <span className="font-medium">منصة الكشتات الأولى في المملكة</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              جهز كشتتك
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-main-accent to-black">
                بخطوة واحدة!
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-second-text/90 mb-8 leading-relaxed">
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

      {/* === Services Section === */}
      <section className="bg-main-bg text-second-text py-20 -mt-12 relative z-20 mb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
              <Award className="w-4 h-4 text-second-text" />
              <span className="text-sm font-bold text-second-text">خدمات مميزة</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
              أحدث الخدمات المتاحة
            </h2>
            <p className="text-xl text-second-text/70 max-w-2xl mx-auto">
              اختر من بين مجموعة مختارة من الخيام والخدمات المجهزة بأحدث المرافق
            </p>
          </div>

          {/* Conditional Rendering: Empty State or Grid */}
          {services.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-second-bg/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-12 h-12 text-second-text/40" />
              </div>
              <p className="text-xl text-second-text/60">لا توجد خدمات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          <div className="text-center mt-12">
            <Link to="/services">
              <button className="text-main-accent font-bold text-lg hover:underline flex items-center justify-center gap-2 mx-auto transition-colors">
                عرض جميع الخدمات والباكجات <TrendingUp size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* === Testimonials Section (Only if available) === */}
      {testimonials.length > 0 && (
        <section className="bg-main-bg py-20 border-y border-second-text/10">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
                <Users className="w-4 h-4 text-second-text" />
                <span className="text-sm font-bold text-second-text">آراء العملاء</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
                ماذا يقول عملاؤنا؟
              </h2>
              <p className="text-xl text-second-text">تجارب حقيقية من عملاء سعداء</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((review, index) => (
                <div
                  key={index}
                  className="bg-second-bg text-main-text p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-main-text/5 hover:-translate-y-1"
                >
                  <div className="mb-4" dir="rtl">
                    <StarsReadOnly rating={review.rating} size={22} />
                  </div>
                  <p className="text-main-text text-lg leading-relaxed mb-6 italic">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-main-text rounded-full flex items-center justify-center text-second-text font-bold text-lg">
                      {review.userName?.charAt(0) || "U"}
                    </div>
                    <div className="text-right">
                      <p className="text-main-text font-bold text-lg">
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

      {/* === CTA Section === */}
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