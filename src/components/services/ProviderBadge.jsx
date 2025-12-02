import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { User, Star, Calendar, Briefcase, ShieldCheck } from "lucide-react";

const ProviderBadge = ({ providerId }) => {
  const [providerData, setProviderData] = useState({
    name: "مقدم خدمة",
    rating: 0,
    ratingCount: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchProviderStats = async () => {
      if (!providerId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", providerId));
        const userData = userDoc.exists() ? userDoc.data() : null;

        if (userData) {
          const servicesQuery = query(collection(db, "services"), where("providerId", "==", providerId));
          const servicesSnap = await getDocs(servicesQuery);


          setStats({
            name: userData.name || userData.fullName || "مقدم خدمة",
            servicesCount: servicesSnap.size,
            rating: 4.9,
            reviewCount: 20,
            joinDate: userData.createdAt?.toDate
              ? userData.createdAt.toDate().toLocaleDateString("ar-SA", { month: 'long', year: 'numeric' })
              : "غير محدد",
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching provider:", error);
      }
    };


    const setStats = (data) => setProviderData(data);

    fetchProviderStats();
  }, [providerId]);

  if (providerData.isLoading) return <div className="h-24 bg-main-bg/5 animate-pulse rounded-3xl mb-8"></div>;

  return (
    <div className="bg-white/60 border border-main-text/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">


      <div className="w-16 h-16 bg-main-text text-second-bg rounded-full flex items-center justify-center text-3xl font-bold shadow-md shrink-0 border-4 border-second-bg">
        {providerData.name.charAt(0).toUpperCase()}
      </div>


      <div className="flex-1 text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <h3 className="text-xl font-extrabold text-main-text">{providerData.name}</h3>
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <ShieldCheck size={12} /> موثوق
          </span>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-main-text/70 mt-2">
          <div className="flex items-center gap-1">
            <Briefcase size={16} className="text-main-accent" />
            <span>{providerData.servicesCount} خدمة</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} className="text-main-accent" />
            <span>انضم {providerData.joinDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-main-text">{providerData.rating}</span>
            <span className="text-xs">({providerData.reviewCount} تقييم)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderBadge;