import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import Select from 'react-select';

// --- Configuration & Constants ---

const NATIONALITIES_OPTIONS = [
  { value: "سعودي", label: "سعودي", flag: "https://flagcdn.com/w40/sa.png" },
  { value: "مصري", label: "مصري", flag: "https://flagcdn.com/w40/eg.png" },
  { value: "أردني", label: "أردني", flag: "https://flagcdn.com/w40/jo.png" },
  { value: "إماراتي", label: "إماراتي", flag: "https://flagcdn.com/w40/ae.png" },
  { value: "كويتي", label: "كويتي", flag: "https://flagcdn.com/w40/kw.png" },
  { value: "لبناني", label: "لبناني", flag: "https://flagcdn.com/w40/lb.png" },
  { value: "جنسية أخرى", label: "جنسية أخرى", flag: null },
];

// Custom styles for React-Select to match the theme
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: state.isFocused ? '#e48a4e' : 'rgba(74, 53, 47, 0.2)',
    borderRadius: '0.75rem',
    padding: '0.5rem',
    boxShadow: 'none',
    color: '#4A352F',
    '&:hover': { borderColor: '#e48a4e' },
  }),
  singleValue: (provided) => ({ ...provided, color: '#4A352F' }),
  input: (provided) => ({ ...provided, color: '#4A352F' }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e48a4e' : state.isFocused ? '#f3e5d8' : 'white',
    color: state.isSelected ? 'white' : '#4A352F',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({ ...provided, color: 'rgba(74, 53, 47, 0.5)' }),
};

// Helper for displaying flag with label in select
const formatOptionLabel = ({ label, flag }) => (
  <div className="flex items-center">
    {flag && <img src={flag} alt={label} className="w-6 h-4 ml-3 rounded-sm object-cover shadow-sm" />}
    <span className="font-medium">{label}</span>
  </div>
);

// Common Input Styles
const INPUT_CLASSES = "w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all";

// --- Main Component ---

function ProviderRegisterPage() {
  const navigate = useNavigate();
  
  // Consolidated Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    countryCode: "+966",
    idNumber: "",
    birthDate: "",
    nationality: null,
    hasCommercialRecord: false
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  // Generic Change Handler for Inputs
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    // Special handling for phone/ID to allow only numbers
    if ((id === 'phone' || id === 'idNumber') && isNaN(value)) return;

    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Specific Handler for React-Select
  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, nationality: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    const { email, password, fullName, phone, idNumber, birthDate, nationality, countryCode, hasCommercialRecord } = formData;

    // 1. Validation Logic
    if (!email || !password || !phone || !fullName || !nationality || !idNumber || !birthDate) {
      setStatus({ ...status, loading: false, error: "الرجاء ملء جميع الحقول المطلوبة." });
      return;
    }
    if (password.length < 6) {
      setStatus({ ...status, loading: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." });
      return;
    }
    if (idNumber.length !== 10) {
      setStatus({ ...status, loading: false, error: "الرجاء إدخال رقم هوية صحيح مكون من 10 أرقام." });
      return;
    }
    if (!phone.startsWith("5") || phone.length !== 9) {
      setStatus({ ...status, loading: false, error: "رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام." });
      return;
    }

    try {
      // 2. Create User Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Prepare Application Data
      const applicationData = {
        uid: user.uid,
        email: email,
        fullName: fullName,
        phone: `${countryCode}${phone}`,
        nationality: nationality.value,
        idNumber: idNumber,
        birthDate: birthDate,
        hasCommercialRecord: hasCommercialRecord,
        role: "customer", // Default role until approved
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      // 4. Save to Firestore (Two Collections: Applications & Users)
      // Save to providerApplications for admin review
      await setDoc(doc(db, "providerApplications", user.uid), applicationData);
      
      // Save to users collection so they can login immediately as a customer
      await setDoc(doc(db, "users", user.uid), {
        ...applicationData,
        role: "customer", 
        name: fullName
      });

      setStatus({ loading: false, error: "", success: "تم إنشاء الحساب وإرسال طلبك! يمكنك الآن استخدام الموقع كعميل حتى تتم الموافقة على طلبك." });

      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      console.error("Registration Error:", err);
      let errorMsg = "حدث خطأ أثناء التسجيل. حاول مرة أخرى.";
      if (err.code === 'auth/email-already-in-use') errorMsg = "هذا البريد الإلكتروني مسجل مسبقاً.";
      
      setStatus({ loading: false, error: errorMsg, success: "" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-main-bg">
      <div className="max-w-2xl w-full bg-second-bg text-main-text rounded-3xl shadow-2xl p-10 border border-main-text/10">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-main-text mb-2">طلب الانضمام كمقدم خدمة</h1>
            <p className="text-main-text/70">سجّل حسابك الآن كعميل، وسيتم ترقيته لمقدم خدمة بعد الموافقة.</p>
        </div>

        {/* Status Messages */}
        {status.error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium border border-red-200">{status.error}</p>}
        {status.success && <p className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 text-center font-medium border border-green-200">{status.success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="email">البريد الإلكتروني</label>
              <input className={INPUT_CLASSES} id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="password">كلمة المرور</label>
              <input className={INPUT_CLASSES} id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="******" />
            </div>
          </div>

          {/* Name & ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="fullName">الاسم الكامل</label>
              <input className={INPUT_CLASSES} id="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="idNumber">رقم الهوية (10 أرقام)</label>
              <input className={INPUT_CLASSES} id="idNumber" type="text" maxLength="10" value={formData.idNumber} onChange={handleChange} required />
            </div>
          </div>

          {/* Phone Number */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="countryCode">المفتاح</label>
              <select className={INPUT_CLASSES} id="countryCode" value={formData.countryCode} onChange={handleChange} required>
                <option value="+966">+966 (SA)</option>
                <option value="+971">+971 (AE)</option>
                <option value="+965">+965 (KW)</option>
                <option value="+20">+20 (EG)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="phone">رقم الجوال</label>
              <input
                className={`${INPUT_CLASSES} text-left`}
                dir="ltr"
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                maxLength={9}
                placeholder="5xxxxxxxx"
                required
              />
            </div>
          </div>

          {/* Nationality & Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="nationality">الجنسية</label>
              <Select
                id="nationality"
                options={NATIONALITIES_OPTIONS}
                value={formData.nationality}
                onChange={handleSelectChange}
                placeholder="-- اختر جنسيتك --"
                styles={selectStyles}
                formatOptionLabel={formatOptionLabel}
                isSearchable={true}
                required
              />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="birthDate">تاريخ الميلاد</label>
              <input className={INPUT_CLASSES} id="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />
            </div>
          </div>

          {/* Commercial Record Checkbox */}
          <div className="flex items-center justify-end gap-3 pt-2 bg-main-bg/5 p-4 rounded-xl border border-main-text/10">
            <label className="text-main-text text-base font-semibold cursor-pointer select-none" htmlFor="hasCommercialRecord">
              هل تمتلك سجل تجاري لتأجير المعدات؟
            </label>
            <input
              type="checkbox"
              id="hasCommercialRecord"
              checked={formData.hasCommercialRecord}
              onChange={handleChange}
              className="h-5 w-5 text-main-accent rounded cursor-pointer accent-main-accent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center pt-4">
            <button
              className="w-full bg-main-text text-second-text px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-main-accent hover:text-main-text transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
              type="submit"
              disabled={status.loading}
            >
              {status.loading ? "جاري الإرسال..." : "تسجيل وتقديم الطلب"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-main-text/60 mt-6">
          <Link to="/login" className="text-main-accent hover:underline font-bold transition-colors">
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ProviderRegisterPage;