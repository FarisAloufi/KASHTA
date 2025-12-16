import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import {
  sendEmailVerification,
  signOut,
  verifyBeforeUpdateEmail
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Edit3, X, Check, RefreshCw, LogOut, Loader
} from 'lucide-react';

// --- Components ---
import Button from "../../components/common/Button"; // Import
import Input from "../../components/common/Input";   // Import

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [timer, setTimer] = useState(0);

  // --- Edit Email States ---
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const navigate = useNavigate();

  // Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Load current email
  useEffect(() => {
    if (auth.currentUser) {
      setNewEmail(auth.currentUser.email);
    }
  }, []);

  const checkEmailVerified = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigate('/');
      } else {
        setMessage({ type: 'info', text: 'لم يتم التفعيل بعد. هل تفقدت البريد المهمل (Spam)؟' });
      }
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (timer > 0) return;
    setLoading(true);
    setMessage(null);
    const user = auth.currentUser;
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage({ type: 'success', text: 'تم إرسال رابط جديد بنجاح!' });
        setTimer(60);
      } catch (error) {
        if (error.code === 'auth/too-many-requests') {
          setMessage({ type: 'error', text: 'يرجى الانتظار قليلاً قبل المحاولة مجدداً.' });
          setTimer(120);
        } else {
          setMessage({ type: 'error', text: 'حدث خطأ: ' + error.message });
        }
      }
    }
    setLoading(false);
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === auth.currentUser.email) {
      setIsEditing(false);
      return;
    }

    setEditLoading(true);
    setMessage(null);
    const user = auth.currentUser;

    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      await updateDoc(doc(db, "users", user.uid), { email: newEmail });

      setMessage({ type: 'success', text: `تم إرسال رابط تفعيل إلى ${newEmail}. يرجى التحقق منه لتأكيد تغيير البريد.` });
      setIsEditing(false);
      setTimer(60);

    } catch (error) {
      console.error(error);
      let errorText = 'حدث خطأ أثناء التحديث.';
      if (error.code === 'auth/email-already-in-use') errorText = 'البريد مستخدم بالفعل بحساب آخر.';
      if (error.code === 'auth/requires-recent-login') errorText = 'يجب تسجيل الخروج والدخول مجدداً لتغيير البريد.';
      if (error.code === 'auth/invalid-email') errorText = 'صيغة البريد غير صحيحة.';
      if (error.code === 'auth/operation-not-allowed') errorText = 'العملية غير مسموحة.';

      setMessage({ type: 'error', text: errorText });
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => navigate('/login'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-6 font-sans">
      <div className="max-w-lg w-full bg-second-bg rounded-[2rem] shadow-2xl overflow-hidden border border-main-bg relative">

        {/* Top Decoration */}
        <div className="h-2 bg-gradient-to-r from-main-text via-main-accent to-main-text w-full absolute top-0"></div>

        <div className="p-8 md:p-12 text-center">

          {/* Icon Animation */}
          <div className="mx-auto w-24 h-24 bg-main-text/5 rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
            <Mail size={40} className="text-main-text drop-shadow-md" />
          </div>

          <h2 className="text-3xl font-black text-main-text mb-2">تفعيل الحساب</h2>
          <p className="text-main-text/60 mb-8 text-lg">
            شكراً لانضمامك! لقد أرسلنا رابط التفعيل إلى:
          </p>

          {/* --- Email Card Section --- */}
          <div className="bg-main-bg/5 border border-main-bg rounded-2xl p-2 mb-8 shadow-inner relative transition-all duration-300">
            {isEditing ? (
              <form onSubmit={handleUpdateEmail} className="flex items-center gap-2 w-full animate-fade-in">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  disabled={editLoading}
                  className="bg-main-bg/5 border-main-accent/50 text-left h-12"
                />

                <Button
                  type="submit"
                  disabled={editLoading}
                  isLoading={editLoading}
                  className="p-3 h-12 w-12 bg-green-600 hover:bg-green-700"
                >
                  {!editLoading && <Check size={20} />}
                </Button>

                <Button
                  type="button"
                  onClick={() => { setIsEditing(false); setNewEmail(auth.currentUser?.email); }}
                  className="p-3 h-12 w-12 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100"
                >
                  <X size={20} />
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-mono text-lg font-bold text-main-text tracking-wide truncate ml-2 dir-ltr">
                  {auth.currentUser?.email}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-main-text/40 hover:text-main-accent hover:bg-main-accent/10 p-2 rounded-xl transition-all"
                  title="تعديل البريد الإلكتروني"
                >
                  <Edit3 size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-100'
              }`}>
              {message.type === 'success' && <Check size={18} />}
              {message.type === 'error' && <X size={18} />}
              {message.text}
            </div>
          )}

          {/* --- Action Buttons --- */}
          <div className="space-y-3">
            <Button
              onClick={checkEmailVerified}
              disabled={loading || editLoading}
              isLoading={loading}
              className="w-full shadow-lg"
              icon={!loading ? RefreshCw : undefined}
            >
              أنا ضغطت الرابط، تحديث الحالة
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={loading || timer > 0 || isEditing}
              variant="outline"
              className={`w-full ${timer > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' : 'border-transparent hover:bg-main-bg/50'}`}
            >
              {timer > 0 ? (
                <>
                  <span>إعادة الإرسال متاحة بعد</span>
                  <span className="font-mono text-lg text-main-accent mx-1">{timer}</span>
                  <span>ثانية</span>
                </>
              ) : (
                <>
                  لم يصلك الرابط؟ <span className="underline decoration-2 decoration-main-accent/50 underline-offset-4 hover:decoration-main-accent mx-1">إعادة الإرسال</span>
                </>
              )}
            </Button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-main-bg/30 p-4 text-center border-t border-main-bg">
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-main-text/50 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            تسجيل الخروج / استخدام حساب آخر
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;