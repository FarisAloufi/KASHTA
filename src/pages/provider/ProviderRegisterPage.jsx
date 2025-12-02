import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import Select from 'react-select';

const NATIONALITIES_OPTIONS = [
  { value: "سعودي", label: "سعودي", flag: "https://flagcdn.com/w40/sa.png" },
  { value: "مصري", label: "مصري", flag: "https://flagcdn.com/w40/eg.png" },
  { value: "أردني", label: "أردني", flag: "https://flagcdn.com/w40/jo.png" },
  { value: "إماراتي", label: "إماراتي", flag: "https://flagcdn.com/w40/ae.png" },
  { value: "كويتي", label: "كويتي", flag: "https://flagcdn.com/w40/kw.png" },
  { value: "لبناني", label: "لبناني", flag: "https://flagcdn.com/w40/lb.png" },
  { value: "جنسية أخرى", label: "جنسية أخرى", flag: null },
];

const customStyles = {
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

function ProviderRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState(null);
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [hasCommercialRecord, setHasCommercialRecord] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !phone || !fullName || !nationality || !idNumber || !birthDate) {
      setError("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (idNumber.length !== 10 || isNaN(idNumber)) {
      setError("الرجاء إدخال رقم هوية صحيح مكون من 10 أرقام.");
      return;
    }

    if (!phone.startsWith("5") || phone.length !== 9) {
      setError("رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const applicationData = {
        uid: user.uid,
        email: email,
        fullName: fullName,
        phone: `${countryCode}${phone}`,
        nationality: nationality.value,
        idNumber: idNumber,
        birthDate: birthDate,
        hasCommercialRecord: hasCommercialRecord,
        role: "customer",
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "providerApplications", user.uid), applicationData);


      await setDoc(doc(db, "users", user.uid), {
        ...applicationData,
        role: "customer",
        name: fullName
      });

      setSuccess("تم إنشاء الحساب وإرسال طلبك! يمكنك الآن استخدام الموقع كعميل حتى تتم الموافقة على طلبك.");

      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      console.error("خطأ في التسجيل:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("هذا البريد الإلكتروني مسجل مسبقاً.");
      } else {
        setError("حدث خطأ أثناء التسجيل. حاول مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatOptionLabel = ({ label, flag }) => (
    <div className="flex items-center">
      {flag && <img src={flag} alt={label} className="w-6 h-4 ml-3 rounded-sm object-cover shadow-sm" />}
      <span className="font-medium">{label}</span>
    </div>
  );

  const inputClasses = "w-full bg-main-bg/5 border border-main-text/20 rounded-xl px-4 py-3 text-main-text focus:outline-none focus:border-main-accent focus:ring-1 focus:ring-main-accent transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-main-bg">
      <div className="max-w-2xl w-full bg-second-bg text-main-text rounded-3xl shadow-2xl p-10 border border-main-text/10">
        <h1 className="text-4xl font-extrabold text-center text-main-text mb-6">
          طلب الانضمام كمقدم خدمة
        </h1>
        <p className="text-center text-main-text/70 mb-8">
          سجّل حسابك الآن كعميل، وسيتم ترقيته لمقدم خدمة بعد الموافقة.
        </p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 text-center font-medium">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input className={inputClasses} id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="password">
                كلمة المرور
              </label>
              <input
                className={inputClasses}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="******"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="fullName">الاسم الكامل</label>
              <input className={inputClasses} id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="idNumber">رقم الهوية (10 أرقام)</label>
              <input className={inputClasses} id="idNumber" type="text" maxLength="10" value={idNumber} onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="countryCode">المفتاح</label>
              <select className={inputClasses} id="countryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required>
                <option value="+966">+966 (SA)</option>
                <option value="+971">+971 (AE)</option>
                <option value="+965">+965 (KW)</option>
                <option value="+20">+20 (EG)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="phone">رقم الجوال</label>
              <input
                className={`${inputClasses} text-left`}
                dir="ltr"
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={9}
                placeholder="5xxxxxxxx"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="nationality">
                الجنسية
              </label>
              <Select
                id="nationality"
                options={NATIONALITIES_OPTIONS}
                value={nationality}
                onChange={setNationality}
                placeholder="-- اختر جنسيتك --"
                styles={customStyles}
                formatOptionLabel={formatOptionLabel}
                isSearchable={true}
                required
              />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="birthDate">
                تاريخ الميلاد
              </label>
              <input
                className={inputClasses}
                id="birthDate" type="date"
                value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <label className="text-main-text text-base font-semibold cursor-pointer" htmlFor="commercialRecord">
              هل تمتلك سجل تجاري لتأجير المعدات؟
            </label>
            <input
              type="checkbox"
              id="commercialRecord"
              checked={hasCommercialRecord}
              onChange={(e) => setHasCommercialRecord(e.target.checked)}
              className="h-5 w-5 text-main-accent rounded cursor-pointer accent-main-accent"
            />
          </div>

          <div className="flex items-center justify-center pt-4">
            <button
              className="w-full bg-main-text text-second-text px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-main-accent hover:text-main-text transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري الإرسال..." : "تسجيل وتقديم الطلب"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-main-text/60 mt-4">
          <Link to="/login" className="text-main-accent hover:underline font-bold">
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ProviderRegisterPage;