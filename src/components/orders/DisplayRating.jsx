import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaStar } from "react-icons/fa";

// --- Sub-Components ---

/**
 * Renders a read-only star rating row.
 * Uses Tailwind colors instead of hardcoded hex values for consistency.
 */
const StarRatingDisplay = ({ rating }) => {
  return (
    <div className="flex gap-1" dir="rtl">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            className={`transition-colors duration-200 ${
              ratingValue <= rating ? "text-yellow-400" : "text-gray-200"
            }`}
            size={24}
          />
        );
      })}
    </div>
  );
};

// --- Main Component ---

function DisplayRating({ bookingId }) {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch rating data when bookingId changes
  useEffect(() => {
    const fetchRating = async () => {
      try {
        // Query the 'ratings' collection for this specific booking
        const ratingsRef = collection(db, "ratings");
        const q = query(ratingsRef, where("bookingId", "==", bookingId));
        const querySnapshot = await getDocs(q);

        // If a rating exists, store the first matching document
        if (!querySnapshot.empty) {
          setRatingData(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching rating:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchRating();
    }
  }, [bookingId]);

  // Loading State
  if (loading) {
    return <p className="text-center text-main-text/50 animate-pulse">جاري تحميل التقييم...</p>;
  }

  // Empty State (No rating found)
  if (!ratingData) {
    return (
      <div className="text-center py-4 border-t border-dashed border-main-text/10 mt-6">
        <p className="text-main-text/50">لم يتم العثور على تقييم لهذا الطلب.</p>
      </div>
    );
  }

  // Render Rating Content
  return (
    <div className="border-t-2 border-dashed border-main-text/10 pt-6 mt-6">
      <h3 className="text-xl font-bold text-main-text text-center mb-4">
        تقييم العميل
      </h3>
      
      <div className="bg-main-bg/5 p-6 rounded-2xl border border-main-text/5">
        <div className="flex justify-center mb-4">
           <StarRatingDisplay rating={ratingData.rating} />
        </div>
        
        <p className="text-main-text/80 text-lg text-center whitespace-pre-wrap leading-relaxed">
          {ratingData.comment || "لا يوجد تعليق مكتوب."}
        </p>
      </div>
    </div>
  );
}

export default DisplayRating;