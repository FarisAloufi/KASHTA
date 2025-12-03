import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Calendar, Briefcase, ShieldCheck, Star } from "lucide-react";

const ProviderBadge = ({ providerId }) => {
  // State to hold provider details and loading status
  const [providerData, setProviderData] = useState({
    name: "مقدم خدمة",
    rating: 0,
    reviewCount: 0,
    servicesCount: 0,
    joinDate: "",
    isLoading: true
  });

  useEffect(() => {
    // 1. Function to fetch provider stats asynchronously
    const fetchProviderStats = async () => {
      if (!providerId) return;

      try {
        // Fetch User Document
        const userDoc = await getDoc(doc(db, "users", providerId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Fetch Services Count for this provider
          const servicesQuery = query(
            collection(db, "services"), 
            where("providerId", "==", providerId)
          );
          const servicesSnap = await getDocs(servicesQuery);

          // Update state with fetched data
          setProviderData({
            name: userData.name || userData.fullName || "مقدم خدمة",
            servicesCount: servicesSnap.size,
            // Note: Ratings are static here for demo purposes (logic preserved)
            rating: 4.9, 
            reviewCount: 20, 
            joinDate: userData.createdAt?.toDate
              ? userData.createdAt.toDate().toLocaleDateString("ar-SA", { month: 'long', year: 'numeric' })
              : "غير محدد",
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching provider details:", error);
        setProviderData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchProviderStats();
  }, [providerId]);

  // 2. Render Loading Skeleton
  if (providerData.isLoading) {
    return <div className="h-24 bg-main-bg/5 animate-pulse rounded-2xl mb-8"></div>;
  }

  // 3. Render Provider Card
  return (
    <div className="bg-white/60 border border-main-text/10 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm transition-all hover:shadow-md">
      
      {/* Avatar Section */}
      <div className="w-16 h-16 bg-main-text text-second-bg rounded-full flex items-center justify-center text-3xl font-bold shadow-md shrink-0 border-4 border-second-bg">
        {providerData.name.charAt(0).toUpperCase()}
      </div>

      {/* Info Section */}
      <div className="flex-1 text-center sm:text-right">
        
        {/* Name & Badge */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <h3 className="text-xl font-extrabold text-main-text">{providerData.name}</h3>
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200">
            <ShieldCheck size={12} /> موثوق
          </span>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-main-text/70">
          
          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Briefcase size={14} className="text-main-accent" />
            <span>{providerData.servicesCount} خدمة</span>
          </div>

          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Calendar size={14} className="text-main-accent" />
            <span>انضم {providerData.joinDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-main-bg/5 px-2 py-1 rounded-lg">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-main-text">{providerData.rating}</span>
            <span className="text-xs opacity-70">({providerData.reviewCount} تقييم)</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProviderBadge;