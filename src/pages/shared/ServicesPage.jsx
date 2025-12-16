import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Palmtree, Tent, Package, Layers, Loader
} from "lucide-react";
import ServiceCard from "../../components/services/ServiceCard";
import SEO from '../../components/common/SEO'; 

// --- Helper Functions ---

const fetchRatingStats = async (itemId) => {
  const ratingsRef = collection(db, "ratings");
  const q = query(ratingsRef, where("serviceId", "==", itemId));
  const ratingsSnap = await getDocs(q);

  let totalRating = 0;
  let validCount = 0;

  ratingsSnap.forEach(r => {
    const val = r.data().rating;
    if (val > 0) {
      totalRating += val;
      validCount++;
    }
  });

  const avgRating = validCount > 0 ? (totalRating / validCount).toFixed(1) : 0;

  return { rating: parseFloat(avgRating), ratingCount: validCount };
};

const fetchCollectionWithRatings = async (collectionName, isPackage = false) => {
  const snapshot = await getDocs(collection(db, collectionName));

  const dataPromises = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    const stats = await fetchRatingStats(doc.id);

    return {
      id: doc.id,
      ...data,
      name: data.name || data.title || data.packageName || data.serviceName,
      price: data.price || data.totalBasePrice,
      displayCategory: data.category || "general",
      isPackage: isPackage,
      ...stats
    };
  });

  return Promise.all(dataPromises);
};

// --- Main Component ---

function ServicesPage() {
  const { t } = useTranslation(); 
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("services"); 
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { userRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [servicesData, packagesData] = await Promise.all([
          fetchCollectionWithRatings("services", false),
          fetchCollectionWithRatings("packages", true)
        ]);

        setServices(servicesData);
        setPackages(packagesData);

      } catch (error) {
        console.error("Error fetching services data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return; 

    try {
      await deleteDoc(doc(db, "services", id));
      await deleteDoc(doc(db, "packages", id));

      setServices(prev => prev.filter(item => item.id !== id));
      setPackages(prev => prev.filter(item => item.id !== id));

      alert(t('services.delete_success')); 
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(t('services.delete_error')); 
    }
  };

  const displayedItems = useMemo(() => {
    const data = viewMode === "services" ? services : packages;
    if (categoryFilter === "all") return data;
    return data.filter(item => item.displayCategory === categoryFilter);
  }, [viewMode, categoryFilter, services, packages]);

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
        title={t('navbar.services')} 
        description={t('services.page_subtitle')} 
      />

      <div className="bg-main-bg min-h-screen py-10 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-second-text mb-2">
              {t('services.page_title')} 
            </h1>
            <p className="text-second-text text-lg">
              {t('services.page_subtitle')} 
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setViewMode("services")}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-150 border-2 ${viewMode === "services" ? "bg-second-text text-main-text border-main-bg shadow-lg scale-105" : "bg-transparent text-second-text border-second-bg hover:bg-second-text/10"}`}
            >
              <Layers size={24} /> {t('services.tab_individual')} 
            </button>
            <button
              onClick={() => setViewMode("packages")}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-150 border-2 ${viewMode === "packages" ? "bg-second-text text-main-text border-main-bg shadow-lg scale-105" : "bg-transparent text-second-text border-second-bg hover:bg-second-text/10"}`}
            >
              <Package size={24} /> {t('services.tab_packages')} 
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex justify-center gap-3 mb-12">
            <button onClick={() => setCategoryFilter("all")} className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "all" ? "bg-second-text text-main-text" : "bg-second-text/40 text-second-text hover:bg-second-text/60"}`}>
              {t('services.filter_all')}
            </button>
            <button onClick={() => setCategoryFilter("sea")} className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "sea" ? "bg-blue-200 text-blue-900" : "bg-second-text/40 text-second-text hover:bg-blue-200/50"}`}>
              <Palmtree size={16} /> {t('services.filter_sea')}
            </button>
            <button onClick={() => setCategoryFilter("land")} className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "land" ? "bg-main-accent text-main-bg" : "bg-second-text/40 text-second-text hover:bg-main-accent/50"}`}>
              <Tent size={16} /> {t('services.filter_land')}
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedItems.length === 0 ? (
              <div className="col-span-full text-center py-20 text-second-text bg-second-text/5 rounded-3xl border-2 border-dashed border-main-bg">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-2xl font-bold">{t('services.no_items')}</p> 
              </div>
            ) : (
              displayedItems.map((item) => (
                <ServiceCard
                  key={item.id}
                  service={item}
                  userRole={userRole}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default ServicesPage;