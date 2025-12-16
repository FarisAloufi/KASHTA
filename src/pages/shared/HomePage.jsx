import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
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
import { 
  Sparkles, TrendingUp, MapPin, Users, Award, Loader, 
  ShieldCheck, Banknote, Headset 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ServiceCard, { StarsReadOnly } from "../../components/services/ServiceCard";
import camping from "../../assets/camping.jpg";
import { useTranslation } from 'react-i18next'; 
import SEO from '../../components/common/SEO';
import AutoTranslatedText from "../../components/common/AutoTranslatedText";

// --- Constants & Configuration ---
const SITE_RATING_ID = "GENERAL_SITE_RATING";

const STATS_DATA = [
  { icon: ShieldCheck, valKey: "home.stats.trusted_val", labelKey: "home.stats.trusted_label" },
  { icon: MapPin, valKey: "home.stats.accurate_val", labelKey: "home.stats.accurate_label" },
  { icon: Banknote, valKey: "home.stats.payment_val", labelKey: "home.stats.payment_label" },
  { icon: Headset, valKey: "home.stats.support_val", labelKey: "home.stats.support_label" },
];

/**
 * Helper function to calculate average rating
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

const StatsSection = ({ t }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      {STATS_DATA.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-second-bg/30 transition-all duration-300 group"
        >
          <stat.icon className="w-10 h-10 mx-auto mb-3 text-main-accent group-hover:scale-110 transition-transform duration-300" />
          
          <div className="text-xl md:text-2xl font-black text-second-text mb-1">
            {t(stat.valKey)} 
          </div>

          <div className="text-sm text-gray-200 font-medium">
            {t(stat.labelKey)}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Component ---

function HomePage() {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userRole } = useAuth();
  const { t } = useTranslation(); 

  // Fetch Data Effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const servicesQuery = query(collection(db, "services"), limit(6));
        const testimonialsQuery = query(
          collection(db, "ratings"),
          where("rating", "==", 5),
          where("serviceId", "==", SITE_RATING_ID),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const [servicesSnapshot, testimonialsSnapshot] = await Promise.all([
          getDocs(servicesQuery),
          getDocs(testimonialsQuery)
        ]);

        const servicesData = servicesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        const servicesWithRatings = await Promise.all(
          servicesData.map(async (service) => {
            const ratingsRef = collection(db, "ratings");
            const q = query(ratingsRef, where("serviceId", "==", service.id));
            const ratingsSnapshot = await getDocs(q);
            const { average, count } = calculateAverageRating(ratingsSnapshot);
            return { ...service, rating: average, ratingCount: count };
          })
        );

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

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm(t('common.confirm_delete'))) return; 

    try {
      await deleteDoc(doc(db, "services", serviceId));
      setServices((prev) => prev.filter((service) => service.id !== serviceId));
    } catch (error) {
      console.error("Error removing service: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="animate-spin text-second-text mx-auto mb-4" size={48} />
          <p className="text-second-text">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={t('navbar.home')} 
        description={t('home.hero_desc')} 
      />

      <div className="min-h-screen">

        {/* === Hero Section === */}
        <header className="relative bg-main-bg text-second-text py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={camping}
              alt="Camping Scenery"
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 text-main-accent" />
                <span className="font-medium text-white">{t('home.badge')}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-white">
                {t('home.hero_title_1')}
                <span className="block mt-2 text-main-accent drop-shadow-lg">
                  {t('home.hero_title_2')}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed font-medium">
                {t('home.hero_desc')}
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/services">
                  <button className="bg-main-accent text-second-text px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-main-accent/50 hover:scale-105 transition-all duration-300">
                    {t('home.btn_explore')}
                  </button>
                </Link>

                <Link to="/about-us">
                  <button className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition-all duration-300">
                    {t('home.btn_how')}
                  </button>
                </Link>
              </div>
            </div>

            <StatsSection t={t} />
          </div>
        </header>

        {/* === Services Section === */}
        <section className="bg-main-bg text-second-text py-20 -mt-8 relative z-20 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 pt-8">
              <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
                <Award className="w-4 h-4 text-second-text" />
                <span className="text-sm font-bold text-second-text">{t('home.featured_badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
                {t('home.featured_title')}
              </h2>
              <p className="text-xl text-second-text/70 max-w-2xl mx-auto">
                {t('home.featured_desc')}
              </p>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-second-bg/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-12 h-12 text-second-text/40" />
                </div>
                <p className="text-xl text-second-text/60">{t('home.no_services')}</p>
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
                  {t('home.view_all')} <TrendingUp size={20} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* === Testimonials Section === */}
        {testimonials.length > 0 && (
          <section className="bg-main-bg py-20 border-y border-second-bg">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-black px-4 py-2 rounded-full mb-4 shadow-sm">
                  <Users className="w-4 h-4 text-second-text" />
                  <span className="text-sm font-bold text-second-text">{t('home.reviews_badge')}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-second-text mb-4">
                  {t('home.reviews_title')}
                </h2>
                <p className="text-xl text-second-text">{t('home.reviews_desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((review, index) => (
                  <div
                    key={index}
                    className="bg-second-bg text-main-text p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-main-bg hover:-translate-y-1"
                  >
                    <div className="mb-4" dir="rtl">
                      <StarsReadOnly rating={review.rating} size={22} />
                    </div>
                    <p className="text-main-text text-lg leading-relaxed mb-6 italic">
                      "<AutoTranslatedText text={review.comment} />"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-main-text rounded-full flex items-center justify-center text-second-text font-bold text-lg">
                        {review.userName?.charAt(0) || "U"}
                      </div>
                      <div className="text-right">
                        <p className="text-main-text font-bold text-lg">
                          {review.userName || t('common.client')}
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
        <section className="bg-main-bg py-20 mb-10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-second-text mb-6">
              {t('home.cta_title')}
            </h2>
            <p className="text-xl text-second-text mb-8 max-w-2xl mx-auto">
              {t('home.cta_desc')}
            </p>
            <Link to="/services">
              <button className="bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300">
                {t('home.btn_start')}
              </button>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}

export default HomePage;