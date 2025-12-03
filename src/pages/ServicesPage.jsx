import React, { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Palmtree, Tent, Package, Layers, Loader
} from "lucide-react";
import ServiceCard from "../components/services/ServiceCard";

// --- Helper Functions ---

/**
 * Fetches ratings for a specific item and calculates average.
 */
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

/**
 * Fetches a collection (services/packages) and attaches ratings to each item.
 */
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
  // State
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("services"); // 'services' or 'packages'
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Contexts
  const { userRole } = useAuth();

  // --- Effects ---

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both collections in parallel
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

  // --- Handlers ---

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      // Try to delete from both potential collections (simplified approach)
      // In a real app, you might want to know the type beforehand.
      await deleteDoc(doc(db, "services", id));
      await deleteDoc(doc(db, "packages", id));

      // Optimistic UI Update
      setServices(prev => prev.filter(item => item.id !== id));
      setPackages(prev => prev.filter(item => item.id !== id));

      alert("تم حذف العنصر بنجاح");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // --- Filter Logic ---

  const displayedItems = useMemo(() => {
    const data = viewMode === "services" ? services : packages;
    if (categoryFilter === "all") return data;
    return data.filter(item => item.displayCategory === categoryFilter);
  }, [viewMode, categoryFilter, services, packages]);

  // --- Render ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="animate-spin text-second-text mx-auto mb-4" size={48} />
          <p className="text-second-text">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2">
            اختر كشتتك
          </h1>
          <p className="text-second-text/70 text-lg">
            جهزنا لك كل شيء، تبي تجمع أغراضك بنفسك أو تختار بكج جاهز؟
          </p>
        </div>

        {/* View Switcher (Individual vs Packages) */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode("services")}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-150 border-2 ${viewMode === "services" ? "bg-second-text text-main-text border-second-text shadow-lg scale-105" : "bg-transparent text-second-text border-second-text/30 hover:bg-second-text/10"}`}
          >
            <Layers size={24} /> خدمات فردية
          </button>
          <button
            onClick={() => setViewMode("packages")}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-150 border-2 ${viewMode === "packages" ? "bg-second-text text-main-text border-second-text shadow-lg scale-105" : "bg-transparent text-second-text border-second-text/30 hover:bg-second-text/10"}`}
          >
            <Package size={24} /> بكجات التوفير
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-3 mb-12">
          <button onClick={() => setCategoryFilter("all")} className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "all" ? "bg-second-text text-main-text" : "bg-second-text/40 text-second-text hover:bg-second-text/60"}`}>الكل</button>
          <button onClick={() => setCategoryFilter("sea")} className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "sea" ? "bg-blue-200 text-blue-900" : "bg-second-text/40 text-second-text hover:bg-blue-200/50"}`}><Palmtree size={16} /> بحر</button>
          <button onClick={() => setCategoryFilter("land")} className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${categoryFilter === "land" ? "bg-main-accent text-main-bg" : "bg-second-text/40 text-second-text hover:bg-main-accent/50"}`}><Tent size={16} /> بر</button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedItems.length === 0 ? (
            <div className="col-span-full text-center py-20 text-second-text/50 bg-second-text/5 rounded-3xl border-2 border-dashed border-second-text/10">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-2xl font-bold">ما حصلنا شيء في هذا القسم حالياً</p>
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
  );
}

export default ServicesPage;