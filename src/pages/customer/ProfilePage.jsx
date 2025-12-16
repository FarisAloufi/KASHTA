import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { User, Mail, Phone, Calendar, Save, Loader, AlertCircle, CheckCircle } from "lucide-react";

// --- Components ---
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import SEO from '../../components/common/SEO';

// --- Libraries ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Styles ---
const PHONE_INPUT_STYLE = {
  width: '100%', height: '50px', borderRadius: '0.75rem',
  borderColor: 'rgba(74, 53, 47, 0.2)', borderWidth: '2px', backgroundColor: 'rgba(255, 255, 255, 0.5))',
  color: '#333', fontSize: '16px'
};

const customDatePickerStyle = `
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker__input-container input {
      width: 100%; height: 50px;
      background-color: rgba(255, 246, 246, 1);
      border: 2px solid rgba(74, 53, 47, 0.2);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #333; outline: none;
  }
  .react-datepicker__input-container input:focus { 
      border-color: #e48a4e; 
      box-shadow: 0 0 0 4px rgba(228, 138, 78, 0.2); 
  }
`;

function ProfilePage() {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "male",
    birthDate: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          let dateObj = null;
          if (data.birthDate) {
            dateObj = new Date(data.birthDate);
          }
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || currentUser.email,
            phone: data.phone || "",
            gender: data.gender || "male",
            birthDate: dateObj
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setStatusMessage({ type: "error", text: t('profile.fetch_error') });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  // 3. Save Handler (Updated for Email)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const dateString = formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : "";

      let emailChanged = false;
      let emailMsg = "";


      if (formData.email !== currentUser.email) {
        try {
          await verifyBeforeUpdateEmail(currentUser, formData.email);
          emailChanged = true;
          emailMsg = " تم إرسال رابط تفعيل إلى بريدك الجديد، يرجى التحقق منه لتأكيد التغيير.";
        } catch (emailError) {
          console.error("Email update error:", emailError);
          if (emailError.code === 'auth/requires-recent-login') {
            throw new Error("لتغيير البريد الإلكتروني، يرجى تسجيل الخروج والدخول مرة أخرى ثم المحاولة.");
          } else if (emailError.code === 'auth/email-already-in-use') {
            throw new Error("البريد الإلكتروني هذا مستخدم بالفعل.");
          } else {
            throw new Error("فشل تحديث البريد الإلكتروني: " + emailError.message);
          }
        }
      }

      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        gender: formData.gender,
        birthDate: dateString,
        email: formData.email
      });

      setStatusMessage({
        type: "success",
        text: t('profile.save_success') + emailMsg
      });


      setTimeout(() => setStatusMessage(null), emailChanged ? 6000 : 3000);

    } catch (error) {
      console.error("Error updating profile:", error);
      setStatusMessage({
        type: "error",
        text: error.message || t('profile.save_error')
      });
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
    <>
      <SEO
        title={t('profile.title')}
        description={t('profile.subtitle')}
      />

      <div className="min-h-screen bg-main-bg py-24 px-4">
        <style>{customDatePickerStyle}</style>

        <div className="container mx-auto max-w-3xl">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-main-text mb-2">{t('profile.title')}</h1>
            <p className="text-second-text/70">{t('profile.subtitle')}</p>
          </div>

          <div className="bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-bg">

            {statusMessage && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 font-bold animate-fade-in ${statusMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                {statusMessage.type === "success" ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex justify-center mb-10">
                <div className="w-24 h-24 bg-main-text text-second-bg rounded-full flex items-center justify-center text-4xl font-bold border-4 border-main-accent shadow-lg">
                  {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : <User size={40} />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-main-text font-bold text-sm flex items-center gap-2 mb-2">
                    <User size={16} className="text-main-accent" /> {t('profile.first_name')}
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t('profile.first_name')}
                    className="bg-main-bg/5 border-main-bg focus:border-main-accent"
                  />
                </div>

                <div>
                  <label className="text-main-text font-bold text-sm flex items-center gap-2 mb-2">
                    <User size={16} className="text-main-accent" /> {t('profile.last_name')}
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t('profile.last_name')}
                    className="bg-main-bg/5 border-main-bg focus:border-main-accent"
                  />
                </div>

                {/* ✅ Email Field */}
                <div className="md:col-span-2">
                  <label className="text-main-text font-bold text-sm flex items-center gap-2 mb-2">
                    <Mail size={16} className="text-main-accent" /> {t('profile.email')}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-main-bg/5 border-main-bg focus:border-main-accent"
                    placeholder="name@example.com"
                  />
                  <p className="text-xs text-main-text/50 mx-1 mt-1 font-bold">
                    {t('profile.email_change_hint')}
                  </p>
                </div>

                <div dir="ltr">
                  <label className="text-main-text font-bold text-sm flex items-center gap-2 mb-2 w-full rtl:text-right ltr:text-left" dir={i18n.dir()}>
                    <Phone size={16} className="text-main-accent" /> {t('profile.phone')}
                  </label>
                  <PhoneInput
                    country={'sa'}
                    value={formData.phone}
                    onChange={phone => setFormData(prev => ({ ...prev, phone: phone }))}
                    containerStyle={{ width: '100%' }}
                    inputStyle={PHONE_INPUT_STYLE}
                    buttonStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      borderRadius: '0.75rem 0 0 0.75rem',
                      borderColor: 'rgba(74, 53, 47, 0.2)',
                      borderWidth: '2px 0 2px 2px'
                    }}
                    dropdownStyle={{ color: 'black', backgroundColor: 'white', textAlign: 'left' }}
                    placeholder="5xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="text-main-text font-bold text-sm flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-main-accent" /> {t('profile.birth_date')}
                  </label>
                  <div dir="ltr">
                    <DatePicker
                      selected={formData.birthDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy/MM/dd"
                      maxDate={new Date()}
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      placeholderText={t('register.select_date')}
                      className="shadow appearance-none border border-main-bg rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-main-bg/5 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-main-text font-bold text-sm block mb-2">{t('profile.gender')}</label>
                  <div className="flex gap-4">
                    {['male', 'female'].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.gender === option
                          ? "bg-main-bg text-second-bg border-main-bg shadow-md scale-[1.02]"
                          : "bg-transparent border-main-bg text-main-text hover:bg-main-bg/5"
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
                        <span>{t(`profile.gender_${option}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div className="mt-10 pt-4">
                <Button
                  type="submit"
                  isLoading={saving}
                  className="w-full text-lg py-4 shadow-xl"
                  icon={!saving ? Save : undefined}
                  variant="primary"
                >
                  {t('profile.save_changes')}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;