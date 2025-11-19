import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Award, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ServiceCard from "../components/services/ServiceCard";

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();

  useEffect(() => {
    setLoading(true);
    const fetchServices = async () => {
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
          })
        );
        setServices(servicesWithRatings);
      } catch (err) {
        console.error("خطأ في جلب الخدمات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDeleteService = async (serviceId) => {
    try {
      const serviceDocRef = doc(db, "services", serviceId);
      await deleteDoc(serviceDocRef);
      setServices((prevServices) =>
        prevServices.filter((service) => service.id !== serviceId)
      );
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-main-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-light-beige">
            جاري تحميل الخدمات...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen">
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
              جميع الخدمات
            </h2>
            <p className="text-xl text-second-text/70 max-w-2xl mx-auto">
              اختر من بين مجموعة واسعة من الخيام والخدمات المجهزة بأحدث المرافق
            </p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-main-bg/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
    </div>
  );
}

export default ServicesPage;
