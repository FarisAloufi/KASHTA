import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { db, auth } from "../../firebase/firebaseConfig";
import Select from 'react-select';
import { useTranslation } from "react-i18next";

// --- Components ---
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import SEO from '../../components/common/SEO';

// --- Icons ---
import { CheckCircle, User } from "lucide-react";

// --- Libraries ---
import ReactCountryFlag from "react-country-flag";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Constants ---
import { NATIONALITIES_OPTIONS } from "../../constants/nationalities";

// --- Styles ---

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#ffffff', 
    borderColor: state.isFocused ? '#e48a4e' : 'rgba(74, 53, 47, 0.2)',
    borderRadius: '0.75rem',
    padding: '0.2rem',
    boxShadow: 'none',
    color: '#4A352F',
    minHeight: '50px',
    '&:hover': { borderColor: '#e48a4e' },
  }),
  singleValue: (provided) => ({ ...provided, color: '#4A352F', fontWeight: 'bold' }),
  input: (provided) => ({ ...provided, color: '#4A352F' }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#e48a4e' : state.isFocused ? '#f3e5d8' : 'white',
    color: state.isSelected ? 'white' : '#4A352F',
    cursor: 'pointer',
    textAlign: 'start'
  }),
  placeholder: (provided) => ({ ...provided, color: '#9CA3AF', opacity: 1 }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const customDatePickerStyle = `
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker__input-container input {
      width: 100%; height: 50px;
      background-color: #ffffff !important; 
      border: 2px solid rgba(74, 53, 47, 0.2);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #4A352F; outline: none;
  }
  .react-datepicker__input-container input::placeholder {
      color: #9CA3AF;
      opacity: 1;
  }
  .react-datepicker__input-container input:focus { border-color: #e48a4e; }
`;


const PHONE_INPUT_STYLE = {
  width: '100%', height: '50px', borderRadius: '0.75rem',
  borderColor: 'rgba(74, 53, 47, 0.2)', borderWidth: '2px', 
  backgroundColor: '#ffffff', // ✅ أبيض صريح
  color: '#4A352F', fontSize: '16px'
};

// --- Helpers ---
const formatOptionLabel = ({ value, label }) => (
  <div className="flex items-center">
    {value !== "OTHER" ? (
      <ReactCountryFlag
        countryCode={value}
        svg
        style={{ width: '1.5em', height: '1.5em', marginInlineEnd: '0.75rem', borderRadius: '4px', objectFit: 'cover' }}
        title={value}
      />
    ) : (
      <span className="me-3 text-lg">🌍</span>
    )}
    <span className="font-bold text-main-text">{label}</span>
  </div>
);

const PasswordRequirementItem = ({ met, text }) => (
  <div className={`flex items-center justify-end gap-3 transition-all duration-300 ${met ? "text-green-700 font-bold" : "text-gray-500"}`}>
    <span className="text-sm">{text}</span>
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] 
        ${met ? "bg-green-600 border-green-600 text-white" : "border-gray-400 bg-main-bg/5"}`}>
      {met ? "✔" : ""}
    </div>
  </div>
);

// --- Main Component ---

function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    idNumber: "",
    birthDate: null,
    nationality: null,
    gender: "male",
    hasCommercialRecord: false,
    commercialRecordNumber: ""
  });

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [ageError, setAgeError] = useState("");

  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    minLength: false
  });

  // --- Handlers ---

  const validatePasswordLive = (password) => {
    setPasswordCriteria({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      minLength: password.length >= 8
    });
  };

  const isPasswordValid = () => {
    const { hasUpperCase, hasLowerCase, hasNumber, minLength } = passwordCriteria;
    return hasUpperCase && hasLowerCase && hasNumber && minLength;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if ((id === 'idNumber' || id === 'commercialRecordNumber') && isNaN(value)) return;

    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
    if (id === 'password') validatePasswordLive(value);
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, nationality: selectedOption }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
    if (date) {
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;

      if (age < 18) {
        setAgeError(t('provider_reg.error_age'));
      } else {
        setAgeError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    const {
      email, password, confirmPassword, fullName,
      idNumber, birthDate, nationality, gender,
      hasCommercialRecord, commercialRecordNumber
    } = formData;

    // Validation
    if (!email || !password || !confirmPassword || !phone || !fullName || !nationality || !idNumber || !birthDate) {
      setStatus({ ...status, loading: false, error: t('register.error_required') });
      return;
    }

    if (!isPasswordValid()) {
      setStatus({ ...status, loading: false, error: t('register.error_password_criteria') });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ ...status, loading: false, error: t('register.error_password_match') });
      return;
    }

    if (ageError) {
      setStatus({ ...status, loading: false, error: t('register.error_age_fix') });
      return;
    }

    if (idNumber.length !== 10) {
      setStatus({ ...status, loading: false, error: t('provider_reg.error_id_length') });
      return;
    }

    if (hasCommercialRecord && (!commercialRecordNumber || commercialRecordNumber.length < 5)) {
      setStatus({ ...status, loading: false, error: t('provider_reg.error_cr_invalid') });
      return;
    }

    try {
      // 1. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Send Verification Email
      await sendEmailVerification(user);

      // 3. Prepare Data
      const dateString = birthDate.toISOString().split('T')[0];
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      const applicationData = {
        uid: user.uid,
        email: email,
        fullName: fullName,
        phone: formattedPhone,
        nationality: nationality.value,
        nationalityLabel: nationality.label,
        idNumber: idNumber,
        gender: gender,
        birthDate: dateString,
        hasCommercialRecord: hasCommercialRecord,
        commercialRecordNumber: hasCommercialRecord ? commercialRecordNumber : null,

        role: "provider",
        status: "pending",
        emailVerified: false,
        submittedAt: serverTimestamp(),
      };

      // 4. Save to Firestore
      await setDoc(doc(db, "providerApplications", user.uid), applicationData);

      await setDoc(doc(db, "users", user.uid), {
        ...applicationData,
        name: fullName,
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        isPhoneVerified: false
      });

      setStatus({ loading: false, error: "", success: t('provider_reg.success_msg') });

      setTimeout(() => {
        navigate("/verify-email");
      }, 2500);

    } catch (err) {
      console.error("Registration Error:", err);
      let errorMsg = t('register.error_generic');
      if (err.code === 'auth/email-already-in-use') errorMsg = t('register.error_email_used');

      setStatus({ loading: false, error: errorMsg, success: "" });
    }
  };

  return (
    <>
      <SEO
        title={t('provider_reg.title')}
        description="انضم إلينا كمزود خدمة وابدأ في تقديم خدماتك عبر منصة كشتة."
      />

      <div className="min-h-screen flex items-center justify-center p-6 bg-main-bg">
        <style>{customDatePickerStyle}</style>

        <div className="max-w-3xl w-full bg-second-bg text-main-text rounded-3xl shadow-2xl p-8 md:p-12 border border-main-bg">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-main-text mb-2">{t('provider_reg.title')}</h1>
            <p className="text-main-text/70">{t('provider_reg.subtitle')}</p>
          </div>

          {status.error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-bold border border-red-200">{status.error}</p>}
          {status.success && <p className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 text-center font-bold border border-green-200">{status.success}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <Input
                id="email"
                label={t('register.email')}
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
              />
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  id="password"
                  label={t('register.password')}
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="******"
                />
              </div>
              <div>
                <Input
                  id="confirmPassword"
                  label={t('register.confirm_password')}
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="******"
                  error={formData.password !== formData.confirmPassword && formData.confirmPassword ? t('register.error_password_match') : ""}
                />
              </div>
            </div>

            <div className="mb-2 px-1">
              <div className="flex flex-col space-y-1 items-end ltr:items-start">
                <PasswordRequirementItem met={passwordCriteria.minLength} text={t('register.req_length')} />
                <PasswordRequirementItem met={passwordCriteria.hasUpperCase && passwordCriteria.hasLowerCase} text={t('register.req_case')} />
                <PasswordRequirementItem met={passwordCriteria.hasNumber} text={t('register.req_number')} />
              </div>
            </div>

            <div className="h-px bg-main-text/10 my-4"></div>

            {/* Name & ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  id="fullName"
                  label={t('provider_reg.full_name')}
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  id="idNumber"
                  label={t('provider_reg.id_number')}
                  type="text"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  placeholder="10xxxxxxxx"
                />
              </div>
            </div>

            {/* Nationality & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-main-text text-base font-bold mb-2 rtl:text-right ltr:text-left">{t('provider_reg.nationality')}</label>
                <Select
                  id="nationality"
                  options={NATIONALITIES_OPTIONS}
                  value={formData.nationality}
                  onChange={handleSelectChange}
                  placeholder={t('provider_reg.select_nationality')}
                  styles={selectStyles}
                  isSearchable={true}
                  required
                  formatOptionLabel={formatOptionLabel}
                />
              </div>

              {/* Gender Cards */}
              <div>
                <label className="block text-main-text text-base font-bold mb-2 rtl:text-right ltr:text-left">{t('register.gender')}</label>
                <div className="flex gap-4">
                  {['male', 'female'].map((option) => (
                    <div
                      key={option}
                      onClick={() => setFormData({ ...formData, gender: option })}
                      className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center justify-center gap-2
                          ${formData.gender === option
                          ? 'bg-main-bg text-second-bg border-main-bg shadow-md scale-[1.02]'
                          : 'bg-main-bg/5 border-main-bg text-main-text hover:bg-main-bg/5/80'
                        }`}
                    >
                      <User size={18} />
                      <span className="font-bold">{t(`profile.gender_${option}`)}</span>
                      {formData.gender === option && <CheckCircle size={16} className="animate-fade-in" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone & Birth Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-main-text text-base font-bold mb-2 rtl:text-right ltr:text-left">{t('register.birth_date')}</label>
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
                    className={`shadow appearance-none border border-main-bg rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-main-bg/5 transition-all ${ageError ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    required
                  />
                </div>
                {ageError && <p className="text-red-600 text-xs mt-1 font-bold text-right">{ageError}</p>}
              </div>

              <div dir="ltr">
                <label className="block text-main-text text-base font-bold mb-2 w-full rtl:text-right ltr:text-left" dir={i18n.dir()}>{t('register.phone')}</label>
                <PhoneInput
                  country={'sa'}
                  value={phone}
                  onChange={phone => setPhone(phone)}
                  containerStyle={{ width: '100%' }}
                  inputStyle={PHONE_INPUT_STYLE}
                  buttonStyle={{
                    backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '0.75rem 0 0 0.75rem', borderColor: 'rgba(74, 53, 47, 0.2)', borderWidth: '2px 0 2px 2px'
                  }}
                  dropdownStyle={{ color: 'black', backgroundColor: 'white', textAlign: 'left' }}
                  placeholder="5xxxxxxxx"
                />
              </div>
            </div>

            {/* Commercial Record */}
            <div className="bg-main-bg/5 p-4 rounded-xl border border-main-bg transition-all hover:bg-main-bg/10">
              <div className="flex items-center justify-end gap-3 cursor-pointer ltr:flex-row-reverse" onClick={() => setFormData(prev => ({ ...prev, hasCommercialRecord: !prev.hasCommercialRecord }))}>
                <label className="text-main-text text-base font-bold cursor-pointer select-none">
                  {t('provider_reg.has_cr')}
                </label>
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${formData.hasCommercialRecord ? 'bg-main-bg border-main-bg' : 'bg-main-bg/5 border-main-/30'}`}>
                  {formData.hasCommercialRecord && <span className="text-white text-sm">✔</span>}
                </div>
              </div>

              {formData.hasCommercialRecord && (
                <div className="mt-4 animate-fade-in">
                  <Input
                    id="commercialRecordNumber"
                    label={t('provider_reg.cr_number')}
                    type="text"
                    value={formData.commercialRecordNumber}
                    onChange={handleChange}
                    placeholder={t('provider_reg.cr_placeholder')}
                    required={formData.hasCommercialRecord}
                    className="placeholder:text-gray-600 placeholder:opacity-100"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-center pt-4">
              <Button
                type="submit"
                isLoading={status.loading}
                className="w-full"
              >
                {t('provider_reg.submit_btn')}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-main-text/60 mt-6">
            <Link to="/login" className="text-main-accent hover:underline font-bold transition-colors">
              {t('register.login_link')}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ProviderRegisterPage;