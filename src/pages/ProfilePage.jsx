import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, Calendar, Save, Loader, AlertCircle, CheckCircle } from "lucide-react";

function ProfilePage() {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    birthDate: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
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
        console.error("Error fetching user data:", error);
        setMessage({ type: "error", text: "حدث خطأ أثناء جلب البيانات." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        gender: formData.gender,
        birthDate: formData.birthDate
      });

      setMessage({ type: "success", text: "تم حفظ التغييرات بنجاح!" });


      setTimeout(() => setMessage({ type: "", text: "" }), 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ. حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  };

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

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2">
            ملفي الشخصي
          </h1>
          <p className="text-second-text/70">
            يمكنك تعديل وتحديث معلومات حسابك من هنا
          </p>
        </div>

        <div className="bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-text/10">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 font-bold ${message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
              }`}>
              {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave}>

            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 bg-main-text text-second-bg rounded-full flex items-center justify-center text-4xl font-bold border-4 border-main-accent shadow-lg">
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : <User size={40} />}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


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


              <div className="space-y-2 md:col-span-2">
                <label className="text-main-text font-bold text-sm">الجنس</label>
                <div className="flex gap-4 mt-1">
                  <label className={`flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === "ذكر" ? "bg-main-text text-second-bg border-main-text shadow-md" : "bg-transparent border-main-text/20 text-main-text hover:bg-main-bg/5"}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="ذكر"
                      checked={formData.gender === "ذكر"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span>ذكر</span>
                  </label>
                  <label className={`flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === "أنثى" ? "bg-main-text text-second-bg border-main-text shadow-md" : "bg-transparent border-main-text/20 text-main-text hover:bg-main-bg/5"}`}>
                    <input
                      type="radio"
                      name="gender"
                      value="أنثى"
                      checked={formData.gender === "أنثى"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span>أنثى</span>
                  </label>
                </div>
              </div>

            </div>


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