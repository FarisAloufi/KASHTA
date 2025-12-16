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
import { useTranslation } from "react-i18next"; 

// --- Components ---
import Button from "../common/Button";

// --- Configuration ---
const GENERAL_RATING_ID = "GENERAL_SITE_RATING";

// --- Sub-Components ---
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
  const { t } = useTranslation(); 
  
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
      setError(t('rating.error_missing')); 
      return;
    }
    if (!userData) {
      setError(t('rating.error_user'));
      return;
    }

    setLoading(true);

    try {
      // 2. Add Rating to Firestore
      await addDoc(collection(db, "ratings"), {
        userId: userData.uid,
        userName: userData.name || t('common.client'),
        serviceId: GENERAL_RATING_ID,
        serviceName: t('rating.general_site_rating'), 
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

      setSuccess(t('rating.success_msg')); 
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError(t('rating.error_generic'));
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
        {t('rating.how_was_experience')} 
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
            {t('rating.write_opinion')} 
          </label>
          <textarea
            className="w-full bg-white border border-main-text/10 rounded-xl py-3 px-4 text-main-text placeholder-main-text/30 focus:outline-none focus:border-main-accent focus:ring-2 focus:ring-main-accent/20 transition-all resize-none shadow-inner"
            id="comment"
            rows="4"
            placeholder={t('rating.placeholder')} 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          isLoading={loading}
          className="w-full shadow-md"
        >
          {loading ? t('common.sending') : t('rating.submit_btn')}
        </Button>
      </form>
    </div>
  );
}

export default RatingForm;