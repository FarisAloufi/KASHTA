import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // ✅ استيراد الترجمة

// --- Sub-Components ---

const StarRatingDisplay = ({ rating }) => {
  return (
    <div className="flex gap-1" dir="ltr">
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
  const { t } = useTranslation(); // ✅ تفعيل الـ hook
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch rating data when bookingId changes
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratingsRef = collection(db, "ratings");
        const q = query(ratingsRef, where("bookingId", "==", bookingId));
        const querySnapshot = await getDocs(q);

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
    return <p className="text-center text-main-text/50 animate-pulse">{t('display_rating.loading')}</p>;
  }

  // Empty State
  if (!ratingData) {
    return (
      <div className="text-center py-4 border-t border-dashed border-main-text/10 mt-6">
        <p className="text-main-text/50">{t('display_rating.not_found')}</p>
      </div>
    );
  }

  // Render Rating Content
  return (
    <div className="border-t-2 border-dashed border-main-text/10 pt-6 mt-6">
      <h3 className="text-xl font-bold text-main-text text-center mb-4">
        {t('display_rating.title')}
      </h3>
      
      <div className="bg-main-bg/5 p-6 rounded-2xl border border-main-text/5">
        <div className="flex justify-center mb-4">
           <StarRatingDisplay rating={ratingData.rating} />
        </div>
        
        <p className="text-main-text/80 text-lg text-center whitespace-pre-wrap leading-relaxed">
          {ratingData.comment || t('display_rating.no_comment')}
        </p>
      </div>
    </div>
  );
}

export default DisplayRating;