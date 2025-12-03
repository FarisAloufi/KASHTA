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

// --- Configuration ---
const GENERAL_RATING_ID = "GENERAL_SITE_RATING";
const GENERAL_RATING_NAME = "تقييم عام للموقع";

// --- Sub-Components ---

/**
 * Interactive Star Rating Component
 * Allows user to select a rating from 1 to 5.
 */
const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center space-x-2 space-x-reverse mb-6">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue} className="cursor-pointer group relative">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <FaStar
              className={`transition-all duration-200 transform group-hover:scale-125 ${
                ratingValue <= rating ? "text-yellow-400 drop-shadow-sm" : "text-gray-300"
              }`}
              size={32}
            />
          </label>
        );
      })}
    </div>
  );
};

// --- Main Component ---

function RatingForm({ booking }) {
  const { userData } = useAuth();
  
  // Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  // UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Validation
    if (rating === 0 || !comment.trim()) {
      setError("الرجاء اختيار تقييم (نجوم) وكتابة تعليق.");
      return;
    }
    if (!userData) {
      setError("خطأ: لم يتم العثور على بيانات المستخدم.");
      return;
    }

    setLoading(true);

    try {
      // 2. Add Rating to Firestore
      await addDoc(collection(db, "ratings"), {
        userId: userData.uid,
        userName: userData.name || "عميل",
        serviceId: GENERAL_RATING_ID,
        serviceName: GENERAL_RATING_NAME,
        bookingId: booking.id,
        rating: rating,
        comment: comment,
        createdAt: serverTimestamp(),
        providerReply: null,
      });

      // 3. Mark Booking as Rated
      const bookingDocRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingDocRef, {
        rated: true,
      });

      setSuccess("شكراً! تم إرسال تقييمك للموقع بنجاح.");
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("حدث خطأ. الرجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Success View
  if (success) {
    return (
      <div className="border-t-2 border-dashed border-main-text/10 pt-6 mt-6 animate-fade-in">
        <p className="bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold shadow-sm border border-green-200">
          {success}
        </p>
      </div>
    );
  }

  // Form View
  return (
    <div className="border-t-2 border-dashed border-main-text/10 pt-8 mt-8">
      <h3 className="text-2xl font-bold text-center mb-6 text-main-text">
        كيف كانت تجربتك مع كشتة؟
      </h3>

      {error && (
        <p className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-center border border-red-100 font-medium text-sm">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-main-bg/5 p-6 rounded-2xl border border-main-text/5">
        
        {/* Star Rating Input */}
        <StarRatingInput rating={rating} setRating={setRating} />

        {/* Comment Input */}
        <div className="mb-5">
          <label
            className="block text-main-text text-sm font-bold mb-2"
            htmlFor="comment"
          >
            اكتب رأيك في الموقع والخدمة بشكل عام
          </label>
          <textarea
            className="w-full bg-white border border-main-text/10 rounded-xl py-3 px-4 text-main-text placeholder-main-text/30 focus:outline-none focus:border-main-accent focus:ring-2 focus:ring-main-accent/20 transition-all resize-none shadow-inner"
            id="comment"
            rows="4"
            placeholder="تجربة ممتازة، الموقع سهل الاستخدام..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-main-text text-second-text font-bold py-3.5 px-4 rounded-xl hover:bg-main-accent hover:text-main-text hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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