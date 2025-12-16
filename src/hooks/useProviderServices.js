import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const useProviderServices = (activeSection, userRole, userId) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || activeSection !== "services") return;

      setLoading(true);
      try {
        const servicesRef = collection(db, "services");
        const packagesRef = collection(db, "packages");
        let qServices, qPackages;

        if (userRole === "admin") {
          qServices = query(servicesRef, orderBy("createdAt", "desc"));
          qPackages = query(packagesRef, orderBy("createdAt", "desc"));
        } else {
          qServices = query(servicesRef, where("providerId", "==", userId));
          qPackages = query(packagesRef, where("providerId", "==", userId));
        }

        const [servicesSnap, packagesSnap] = await Promise.all([
          getDocs(qServices),
          getDocs(qPackages)
        ]);

        const servicesData = servicesSnap.docs.map((doc) => ({
          id: doc.id, ...doc.data(), type: "service"
        }));
        const packagesData = packagesSnap.docs.map((doc) => ({
          id: doc.id, ...doc.data(), type: "package"
        }));

        const combined = [...servicesData, ...packagesData].sort((a, b) => {
           const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
           const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
           return dateB - dateA;
        });

        setServices(combined);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSection, userRole, userId]);

  return { services, loading, setServices };
};