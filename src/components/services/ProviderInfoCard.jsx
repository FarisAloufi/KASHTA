import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User, Star, Briefcase, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next"; // ✅ استيراد الترجمة

const ProviderInfoCard = ({ providerId }) => {
  const { t } = useTranslation(); // ✅ تفعيل الـ hook
  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState({ rating: 0, reviewCount: 0, servicesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!providerId) return;

      try {
        // 1. Fetch Provider Profile
        const userDoc = await getDoc(doc(db, "users", providerId));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        setProvider(userData);

        // 2. Fetch Services Count
        const servicesRef = collection(db, "services");
        const servicesQuery = query(servicesRef, where("providerId", "==", providerId));
        const servicesSnap = await getDocs(servicesQuery);
        
        const myServicesIds = servicesSnap.docs.map(doc => doc.id);

        // 3. Calculate Aggregated Ratings
        let totalStars = 0;
        let totalCount = 0;

        if (myServicesIds.length > 0) {
          const ratingsPromises = myServicesIds.map(async (serviceId) => {
            const ratingsQuery = query(
              collection(db, "ratings"),
              where("serviceId", "==", serviceId)
            );
            const ratingsSnap = await getDocs(ratingsQuery);
            ratingsSnap.forEach((rDoc) => {
              const val = rDoc.data().rating;
              if (val > 0) {
                totalStars += val;
                totalCount++;
              }
            });
          });
          
          await Promise.all(ratingsPromises);
        }

        const finalRating = totalCount > 0 ? (totalStars / totalCount).toFixed(1) : 0;

        setStats({
          servicesCount: servicesSnap.size,
          rating: finalRating,
          reviewCount: totalCount
        });

      } catch (error) {
        console.error("Error fetching provider stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [providerId]);

  // Loading Skeleton
  if (loading) return <div className="h-24 bg-main-bg/5 animate-pulse rounded-3xl mb-8"></div>;
  if (!provider) return null;

  return (
    <div className="bg-second-bg border border-main-bg rounded-3xl p-6 mb-8 shadow-lg">
      
      {/* Header: Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-main-text text-second-bg rounded-full flex items-center justify-center text-3xl font-bold shadow-md border-2 border-main-accent shrink-0">
          {provider.name ? provider.name.charAt(0).toUpperCase() : <User />}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-main-text">{provider.name}</h3>
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200">
              <ShieldCheck size={12} /> {t('provider.trusted')}
            </span>
          </div>
          <p className="text-xs text-main-text/60 font-medium mt-1">{t('provider.certified')}</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between gap-3 text-sm text-main-text/70 bg-main-bg/5 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-main-accent" />
          <span className="font-bold">{stats.servicesCount} {t('provider.services_count')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-main-text">{stats.rating}</span>
          <span className="text-xs font-normal opacity-70">({stats.reviewCount} {t('provider.reviews')})</span>
        </div>
      </div>

    </div>
  );
};

export default ProviderInfoCard;