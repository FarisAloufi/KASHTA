import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

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
              className="cursor-pointer transition-colors hover:scale-110"
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
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (rating === 0 || !comment) {
      setError("الرجاء اختيار تقييم (نجوم) وكتابة تعليق.");
      return;
    }
    if (!userData) {
      setError("خطأ: لم يتم العثور على بيانات المستخدم.");
      return;
    }

    setLoading(true);

    try {
      // --- التعديل هنا: حفظ التقييم كتقييم عام للموقع مرة واحدة فقط ---
      
      await addDoc(collection(db, "ratings"), {
        userId: userData.uid,
        userName: userData.name || "عميل",
        
        // نضع ID ثابت أو مميز ليدل على أنه تقييم للموقع وليس لخدمة محددة
        serviceId: "GENERAL_SITE_RATING", 
        serviceName: "تقييم عام للموقع",
        
        bookingId: booking.id, // ربط التقييم برقم الحجز كمرجع
        rating: rating,
        comment: comment,
        createdAt: serverTimestamp(),
        providerReply: null
      });

      // تحديث حالة الطلب إلى "تم التقييم"
      const bookingDocRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingDocRef, {
        rated: true,
      });

      setSuccess("شكراً! تم إرسال تقييمك للموقع بنجاح.");
      setLoading(false);
    } catch (err) {
      console.error("خطأ في إرسال التقييم:", err);
      setError("حدث خطأ. الرجاء المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="border-t-2 border-dashed border-main-text/20 pt-6 mt-6">
        <p className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold shadow-sm">
          {success}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t-2 border-dashed border-main-text/20 pt-6 mt-6">
      <h3 className="text-2xl font-bold text-center mb-4 text-main-text">
        كيف كانت تجربتك مع كشتة؟
      </h3>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-center border border-red-200">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-second-bg/20 p-6 rounded-2xl border border-main-text/10">
        <StarRating rating={rating} setRating={setRating} />

        <div className="mb-4">
          <label
            className="block text-main-text text-sm font-bold mb-2 text-right"
            htmlFor="comment"
          >
            اكتب رأيك في الموقع والخدمة بشكل عام
          </label>
          <textarea
            className="shadow-sm appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text leading-tight focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all"
            id="comment"
            rows="4"
            placeholder="تجربة ممتازة، الموقع سهل..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <button
          className="w-full bg-main-text text-second-text font-bold py-3 px-4 rounded-xl hover:bg-main-accent hover:text-main-text transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? "جاري الإرسال..." : "إرسال التقييم"}
        </button>
      </form>
    </div>
  );
}

export default RatingForm;