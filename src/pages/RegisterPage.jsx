import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// --- Constants ---
const DEFAULT_COUNTRY_CODE = "+966";
const GOOGLE_ICON_URL = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

// --- Main Component ---

function RegisterPage() {
  const navigate = useNavigate();

  // Consolidated Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "ذكر",
    birthDate: ""
  });

  const [status, setStatus] = useState({ loading: false, error: "" });

  // Generic Input Handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    // Allow only numbers for phone
    if (id === 'phone' && isNaN(value)) return;

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // --- Handlers ---

  /**
   * Handle Standard Registration
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const { firstName, lastName, phone, birthDate, email, password, gender } = formData;

    // 1. Validation
    if (!firstName || !lastName || !phone || !birthDate || !email || !password) {
      setStatus({ loading: false, error: "الرجاء تعبئة جميع الحقول." });
      return;
    }

    try {
      // 2. Create User in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Save User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: user.email,
        phone: `${DEFAULT_COUNTRY_CODE}${phone}`,
        gender: gender,
        birthDate: birthDate,
        role: "customer",
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      console.error("Registration Error:", err.message);
      let errorMsg = "حدث خطأ. الرجاء المحاولة مرة أخرى.";

      if (err.code === "auth/email-already-in-use") errorMsg = "هذا البريد الإلكتروني مسجل مسبقاً.";
      else if (err.code === "auth/weak-password") errorMsg = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

      setStatus({ loading: false, error: errorMsg });
    }
  };

  /**
   * Handle Google OAuth Registration
   */
  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists before creating
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const names = user.displayName ? user.displayName.split(" ") : ["", ""];

        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          email: user.email,
          role: "customer",
          createdAt: new Date(),
          phone: "",
          gender: "",
          birthDate: ""
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Google Register Error:", err);
      setStatus({ loading: false, error: "حدث خطأ أثناء إنشاء الحساب عبر Google." });
    }
  };

  // --- Render ---

  // Common Input Class
  const inputClass = "shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
      <div className="max-w-2xl w-full bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-bg/10">

        <h2 className="text-4xl font-extrabold text-center text-main-text mb-8">
          إنشاء حساب جديد
        </h2>

        {status.error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-bold animate-pulse border border-red-200">
            {status.error}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الاسم الأول</label>
              <input
                id="firstName"
                className={inputClass}
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الاسم الأخير</label>
              <input
                id="lastName"
                className={inputClass}
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Gender & Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الجنس</label>
              <select
                id="gender"
                className={inputClass}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">تاريخ الميلاد</label>
              <input
                id="birthDate"
                className={inputClass}
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-main-text text-base font-bold mb-2 text-right">رقم الجوال</label>
            <div className="flex direction-ltr">
              <input
                id="phone"
                className={`${inputClass} text-left`}
                type="tel"
                placeholder="50xxxxxxx"
                value={formData.phone}
                onChange={handleChange}
                maxLength={9}
                required
              />
              <span className="flex items-center justify-center px-4 bg-main-bg/10 border border-main-text/20 rounded-xl mr-2 font-bold text-main-text select-none">
                {DEFAULT_COUNTRY_CODE}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-main-text text-base font-bold mb-2 text-right">البريد الإلكتروني</label>
            <input
              id="email"
              className={inputClass}
              type="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label className="block text-main-text text-base font-bold mb-2 text-right">كلمة المرور</label>
            <input
              id="password"
              className={inputClass}
              type="password"
              placeholder="***********"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            className="bg-main-text text-second-text w-full font-bold py-4 rounded-2xl hover:bg-main-accent hover:text-main-text transition-all shadow-lg disabled:opacity-50 hover:-translate-y-1 transform"
            type="submit"
            disabled={status.loading}
          >
            {status.loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>

          {/* Google Button */}
          <button
            onClick={handleGoogleRegister}
            type="button"
            className="bg-white mt-4 text-black px-7 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition-all w-full flex items-center justify-center gap-3 border border-gray-300"
          >
            <img src={GOOGLE_ICON_URL} alt="Google" className="w-6 h-6" />
            إنشاء حساب عبر Google
          </button>

          {/* Login Link */}
          <Link
            to="/login"
            className="inline-block text-center w-full mt-6 font-bold text-main-text hover:text-main-accent underline transition-colors"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>

        </form>
      </div>
    </div>
  );
}

export default RegisterPage;