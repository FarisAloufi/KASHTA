import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaStar } from 'react-icons/fa';


const StarsReadOnly = ({ rating }) => {
  return (
    <div className="flex space-x-1 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
            size={24}
          />
        );
      })}
    </div>
  );
};


function DisplayRating({ bookingId }) {
  const [ratingData, setRatingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 
    const fetchRating = async () => {
      try {
        const ratingsRef = collection(db, "ratings");

        const q = query(ratingsRef, where("bookingId", "==", bookingId));
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
      
          const ratingDoc = querySnapshot.docs[0].data();
          setRatingData(ratingDoc);
        }
      } catch (err) {
        console.error("خطأ في جلب التقييم:", err);
      }
      setLoading(false);
    };

    fetchRating();
  }, [bookingId]);

  if (loading) {
    return <p className="text-center text-gray-500">جاري تحميل التقييم...</p>;
  }

  if (!ratingData) {
    return <p className="text-center text-gray-500">لم يتم العثور على التقييم.</p>;
  }


  return (
    <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
      <h3 className="text-2xl font-bold text-center mb-4">تقييم العميل</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <StarsReadOnly rating={ratingData.rating} />
        <p className="text-gray-700 mt-3 text-lg" style={{ whiteSpace: 'pre-wrap' }}>
          {ratingData.comment}
        </p>
      </div>
    </div>
  );
}

export default DisplayRating;