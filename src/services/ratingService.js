import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

/**
 * Subscribes to real-time rating updates for a specific service.
 * Calculates the average rating and total count whenever the database changes.
 * * @param {string} serviceId - The ID of the service to monitor.
 * @param {function} callback - Function called with { average, count } on updates.
 * @returns {function} Unsubscribe function to stop listening.
 */
export const subscribeToAverageRating = (serviceId, callback) => {
  // Reference to the ratings collection
  const ratingsRef = collection(db, "ratings");
  
  // Create a query against the specific serviceId
  const q = query(ratingsRef, where("serviceId", "==", serviceId));

  // Start real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    let totalRating = 0;
    let count = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure rating exists and is a valid number before adding
      if (data.rating && typeof data.rating === "number") {
        totalRating += data.rating;
        count += 1;
      }
    });

    // Calculate average (avoid division by zero)
    const average = count > 0 ? (totalRating / count).toFixed(1) : 0;

    // Execute callback with processed data
    callback({
      average: parseFloat(average),
      count: count,
    });
  }, (error) => {
    console.error("Error listening to rating updates:", error);
  });

  // Return the unsubscribe function to clean up the listener
  return unsubscribe;
};