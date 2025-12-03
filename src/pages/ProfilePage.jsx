import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Calendar, Save, Loader, AlertCircle, CheckCircle } from "lucide-react";

// --- Main Component ---

function ProfilePage() {
  const { currentUser } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "ذكر",
    birthDate: ""
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // 1. Fetch User Data on Load
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Pre-fill form with existing data or defaults
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || currentUser.email,
            phone: data.phone || "",
            gender: data.gender || "ذكر",
            birthDate: data.birthDate || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setStatusMessage({ type: "error", text: "فشل في جلب بيانات الملف الشخصي." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // 2. Input Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Save Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const userRef = doc(db, "users", currentUser.uid);

      // Update Firestore document
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(), // Combined display name
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate
      });

      setStatusMessage({ type: "success", text: "تم حفظ التغييرات بنجاح!" });

      // Clear success message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setStatusMessage({ type: "error", text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  };

  // Loading View
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg py-12 px-4">
      <div className="container mx-auto max-w-3xl">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2">
            ملفي الشخصي
          </h1>
          <p className="text-second-text/70">
            يمكنك تعديل وتحديث معلومات حسابك من هنا
          </p>
        </div>

        <div className="bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-text/10">

          {/* Status Message Alert */}
          {statusMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 font-bold animate-fade-in ${statusMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
              }`}>
              {statusMessage.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSave}>

            {/* Profile Picture Placeholder */}
            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 bg-main-text text-second-bg rounded-full flex items-center justify-center text-4xl font-bold border-4 border-main-accent shadow-lg">
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : <User size={40} />}
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* First Name */}
              <div className="space-y-2">
                <label className="text-main-text font-bold text-sm flex items-center gap-2">
                  <User size={16} className="text-main-accent" /> الاسم الأول
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all"
                  placeholder="الاسم الأول"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-main-text font-bold text-sm flex items-center gap-2">
                  <User size={16} className="text-main-accent" /> الاسم الأخير
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all"
                  placeholder="الاسم الأخير"
                />
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-main-text font-bold text-sm flex items-center gap-2">
                  <Mail size={16} className="text-main-accent" /> البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-main-text/10 border border-main-text/10 rounded-xl px-4 py-3 text-main-text/60 cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-main-text/40 mr-1">لا يمكن تغيير البريد الإلكتروني.</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-main-text font-bold text-sm flex items-center gap-2">
                  <Phone size={16} className="text-main-accent" /> رقم الجوال
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all text-left"
                    dir="ltr"
                    placeholder="5xxxxxxxx"
                  />
                  <span className="absolute right-3 top-3.5 text-main-text/50 text-sm font-bold pointer-events-none">
                    +966
                  </span>
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-main-text font-bold text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-main-accent" /> تاريخ الميلاد
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-main-text font-bold text-sm">الجنس</label>
                <div className="flex gap-4 mt-1">
                  {["ذكر", "أنثى"].map((option) => (
                    <label
                      key={option}
                      className={`flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === option
                          ? "bg-main-text text-second-bg border-main-text shadow-md scale-[1.02]"
                          : "bg-transparent border-main-text/20 text-main-text hover:bg-main-bg/5"
                        }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="mt-10">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-main-text text-second-text py-4 rounded-xl font-extrabold text-lg shadow-xl hover:bg-main-accent hover:text-main-text hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save /> حفظ التغييرات
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;