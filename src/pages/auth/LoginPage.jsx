import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import SEO from '../../components/common/SEO';

// --- Constants ---
const GOOGLE_ICON_URL = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- Helper: Translate Error Messages ---
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return t('login.error_invalid_cred');
      case "auth/too-many-requests":
        return t('login.error_too_many');
      case "auth/user-disabled":
        return t('login.error_disabled');
      case "auth/invalid-email":
        return t('login.error_invalid_email');
      default:
        return t('login.error_generic');
    }
  };

  // --- State Management ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Reset Password State ---
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState({ loading: false, msg: "", type: "" });

  // --- Handlers ---

  // 1. Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        navigate("/verify-email");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login Error:", err.message);
      setError(getErrorMessage(err.code));
    }
    setLoading(false);
  };

  // 2. Google Login
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
      console.error("Google Login Error:", err);
      setError(t('login.error_google'));
    }
  };

  // 3. Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetStatus({ loading: true, msg: "", type: "" });

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus({
        loading: false,
        msg: t('login.reset_success'),
        type: "success"
      });
    } catch (error) {
      let msg = t('login.reset_error_generic');
      if (error.code === 'auth/user-not-found') msg = t('login.reset_error_not_found');
      if (error.code === 'auth/invalid-email') msg = t('login.error_invalid_email');

      setResetStatus({ loading: false, msg: msg, type: "error" });
    }
  };

  return (
    <>
      <SEO
        title={t('login.title')}
        description="سجل الدخول إلى حسابك في منصة كشتة."
      />

      <div className="min-h-screen flex items-center justify-center bg-main-bg p-6 relative">

        {/* --- Reset Password Modal --- */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-second-bg rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in relative">
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-500 hover:text-red-500 font-bold text-xl"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold text-center mb-4 text-main-text">{t('login.reset_title')}</h3>
              <p className="text-main-text/70 text-center mb-6 text-sm">{t('login.reset_desc')}</p>

              {resetStatus.msg && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-bold text-center ${resetStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {resetStatus.msg}
                </div>
              )}

              <form onSubmit={handleResetPassword}>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  isLoading={resetStatus.loading}
                  className="w-full mt-4"
                >
                  {t('login.reset_btn')}
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="max-w-md w-full bg-second-bg rounded-3xl shadow-2xl p-10 border border-main-bg">

          <h2 className="text-4xl font-extrabold text-center text-main-text mb-8">
            {t('login.title')}
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin}>

            {/* Email Input */}
            <div className="mb-6">
              <Input
                id="email"
                type="email"
                label={t('login.email_label')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-2">
              <Input
                id="password"
                type="password"
                label={t('login.password_label')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*********"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end mb-8 ltr:justify-end rtl:justify-end">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                  setResetStatus({ loading: false, msg: "", type: "" });
                }}
                className="text-sm font-bold text-main-text/70 hover:text-main-accent hover:underline transition-all"
              >
                {t('login.forgot_password')}
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
            >
              {t('login.login_btn')}
            </Button>
          </form>

          {/* Google Login & Links */}
          <div className="mt-6 border-t  border-main-bg pt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="bg-white/50 text-black px-7 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-[1.02] transition-all w-full flex items-center justify-center gap-3 border border-main-bg"
            >
              <img src={GOOGLE_ICON_URL} alt="Google" className="w-6 h-6" />
              {t('login.google_btn')}
            </button>

            <div className="mt-6 space-y-3 text-center">
              <Link to="/register" className="block font-semibold text-main-text hover:text-main-accent transition-colors">
                {t('login.register_link')}
              </Link>
              <Link to="/provider-apply" className="block font-semibold text-main-text hover:text-main-accent transition-colors">
                {t('login.provider_link')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default LoginPage;