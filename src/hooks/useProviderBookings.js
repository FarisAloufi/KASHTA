import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const useProviderBookings = (userRole, userId) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let fetchedBookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (userRole === "provider") {
        fetchedBookings = fetchedBookings
          .filter(booking => {
            const items = booking.items || booking.services || [];
            return items.some(item => item.providerId === userId);
          })
          .map(booking => {
            const items = booking.items || booking.services || [];
            const myServices = items.filter(item => item.providerId === userId);

            const myTotal = myServices.reduce(
              (sum, item) => sum + (Number(item.servicePrice) * Number(item.quantity)), 0
            );

            const myStatus = myServices[0]?.status || 'pending';

            return {
              ...booking,
              services: myServices,
              items: myServices,
              totalPrice: myTotal,
              totalItems: myServices.length,
              status: myStatus
            };
          });
      }

      setBookings(fetchedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userRole, userId]);

  return { bookings, loading, setBookings };
};