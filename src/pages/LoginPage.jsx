import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// --- Constants & Styles ---
const GOOGLE_ICON_URL = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

// Reusable styles for input fields
const INPUT_CLASSES = "shadow appearance-none border rounded-xl w-full py-3 px-4 text-black focus:ring-2 focus:ring-black outline-none transition-all";

// Helper to map Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
    default:
      return "حدث خطأ. الرجاء المحاولة مرة أخرى.";
  }
};

// --- Main Component ---

function LoginPage() {
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- Handlers ---

  /**
   * Handle Standard Email/Password Login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err.message);
      setError(getErrorMessage(err.code));
    }
  };

  /**
   * Handle Google OAuth Login
   * Checks if user exists in Firestore before creating a new doc.
   */
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Check if user document already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 2. If new user, create a profile document
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "customer", // Default role
          createdAt: new Date(),
        });
      }

      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);
      setError("حدث خطأ أثناء تسجيل الدخول عبر Google.");
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
      <div className="max-w-md w-full bg-second-bg rounded-3xl shadow-2xl p-10 border border-main-bg/70">

        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          تسجيل الدخول
        </h2>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium border border-red-200 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-black text-base font-semibold mb-2 text-right" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              className={INPUT_CLASSES}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <label className="block text-black text-base font-semibold mb-2 text-right" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              className={INPUT_CLASSES}
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-black text-white w-full font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            تسجيل الدخول
          </button>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="bg-white mt-4 text-black px-7 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition-all w-full flex items-center justify-center gap-3 border border-gray-300"
          >
            <img src={GOOGLE_ICON_URL} alt="Google" className="w-6 h-6" />
            تسجيل الدخول عبر Google
          </button>

          {/* Navigation Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link to="/register" className="block font-semibold text-[#3e2723] hover:text-[#e48a4e] transition-colors">
              ليس لديك حساب؟ أنشئ حساباً
            </Link>

            <Link to="/provider-apply" className="block font-semibold text-[#3e2723] hover:text-[#e48a4e] transition-colors">
              هل ترغب بالانضمام كمقدم خدمة؟ سجل طلبك هنا
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;