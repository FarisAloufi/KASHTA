import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Calendar, Briefcase, ShieldCheck, Star } from "lucide-react";
import { useTranslation } from "react-i18next"; // ✅ استيراد الترجمة

const ProviderBadge = ({ providerId }) => {
  const { t, i18n } = useTranslation(); // ✅ تفعيل الـ hook
  
  const [providerData, setProviderData] = useState({
    name: "",
    rating: 0,
    reviewCount: 0,
    servicesCount: 0,
    joinDate: "",
    isLoading: true
  });

  useEffect(() => {
    const fetchProviderStats = async () => {
      if (!providerId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", providerId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          const servicesQuery = query(
            collection(db, "services"), 
            where("providerId", "==", providerId)
          );
          const servicesSnap = await getDocs(servicesQuery);

          setProviderData({
            name: userData.name || userData.fullName || t('provider.default_name'),
            servicesCount: servicesSnap.size,
            rating: 4.9, 
            reviewCount: 20, 
            // ✅ تنسيق التاريخ بناءً على اللغة الحالية
            joinDate: userData.createdAt?.toDate
              ? userData.createdAt.toDate().toLocaleDateString(i18n.language === 'ar' ? "ar-SA" : "en-US", { month: 'long', year: 'numeric' })
              : t('provider.unknown_date'),
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching provider details:", error);
        setProviderData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProviderStats();
  }, [providerId, t, i18n.language]); // ✅ إعادة التشغيل عند تغيير اللغة

  if (providerData.isLoading) {
    return <div className="h-24 bg-main-bg/5 animate-pulse rounded-2xl mb-8"></div>;
  }

  return (
    <div className="bg-white/60 border border-main-bg rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm transition-all hover:shadow-md">
      
      {/* Avatar Section */}
      <div className="w-16 h-16 bg-main-text text-second-bg rounded-full flex items-center justify-center text-3xl font-bold shadow-md shrink-0 border-4 border-main-bg">
        {providerData.name.charAt(0).toUpperCase()}
      </div>

      {/* Info Section */}
      <div className="flex-1 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
        
        {/* Name & Badge */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <h3 className="text-xl font-extrabold text-main-text">{providerData.name}</h3>
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200">
            <ShieldCheck size={12} /> {t('provider.trusted')}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-main-text/70">
          
          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Briefcase size={14} className="text-main-accent" />
            <span>{providerData.servicesCount} {t('provider.services_count')}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Calendar size={14} className="text-main-accent" />
            <span>{t('provider.joined')} {providerData.joinDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-main-text">{providerData.rating}</span>
            <span className="text-xs opacity-70">({providerData.reviewCount} {t('provider.reviews')})</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderBadge;