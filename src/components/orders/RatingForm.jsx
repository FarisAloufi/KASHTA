import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext'; 


const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center space-x-2 space-x-reverse mb-4">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <FaStar
              className="cursor-pointer"
              color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
              size={40}
            />
          </label>
        );
      })}
    </div>
  );
};

function RatingForm({ booking }) {
  const { userData } = useAuth(); 
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (rating === 0 || !comment) {
      setError('الرجاء اختيار تقييم (نجوم) وكتابة تعليق.');
      return;
    }
    if (!userData) {
        setError('خطأ: لم يتم العثور على بيانات المستخدم.');
        return;
    }
    setLoading(true);

    try {

      await addDoc(collection(db, "ratings"), {
        userId: userData.uid,
        userName: userData.name, 
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        bookingId: booking.id,
        rating: rating,
        comment: comment,
        createdAt: serverTimestamp(),
      });


      const bookingDocRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingDocRef, {
        rated: true
      });

      setSuccess('شكراً على تقييمك!');
      setLoading(false);

    } catch (err) {
      console.error("خطأ في إرسال التقييم:", err);
      setError('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
        <p className="bg-green-100 text-green-700 p-4 rounded text-center font-bold">{success}</p>
      </div>
    );
  }

  return (
    <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
      <h3 className="text-2xl font-bold text-center mb-4">ما رأيك في الخدمة؟</h3>
      
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit}>
        <StarRating rating={rating} setRating={setRating} />
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 text-right" htmlFor="comment">
            اكتب تعليقك
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="comment"
            rows="4"
            placeholder="كيف كانت الكشتة؟..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
          type="submit"
          disabled={loading}
        >
          {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </form>
    </div>
  );
}

export default RatingForm;