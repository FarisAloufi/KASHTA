import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

// --- Components ---
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import SEO from '../../components/common/SEO';

// --- Libraries ---
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// --- Constants ---
const GOOGLE_ICON_URL = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

function RegisterPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // --- State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    birthDate: null
  });

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  // --- Validation States ---
  const [ageError, setAgeError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    minLength: false
  });

  // --- Handlers ---
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id === 'password') {
      validatePasswordLive(value);
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, birthDate: date });
    if (date) {
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
      }
      if (age < 16) {
        setAgeError(t('register.error_age'));
      } else {
        setAgeError("");
      }
    }
  };

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

  // --- Register Handler ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const { firstName, lastName, birthDate, email, password, confirmPassword } = formData;

    // 1. Validation
    if (!firstName || !lastName || !phone || !birthDate || !email || !password || !confirmPassword) {
      setStatus({ loading: false, error: t('register.error_required') });
      return;
    }

    if (ageError) {
      setStatus({ loading: false, error: t('register.error_age_fix') });
      return;
    }

    if (!isPasswordValid()) {
      setStatus({ loading: false, error: t('register.error_password_criteria') });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ loading: false, error: t('register.error_password_match') });
      return;
    }

    try {
      // 2. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Send Verification Email
      await sendEmailVerification(user);

      // 4. Save to Firestore
      const dateString = birthDate.toISOString().split('T')[0];
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: user.email,
        phone: formattedPhone,
        gender: formData.gender,
        birthDate: dateString,
        role: "customer",
        isPhoneVerified: false,
        mfaEnabled: false,
        createdAt: new Date(),
      });

      // 5. Navigate
      navigate("/verify-email");

    } catch (err) {
      console.error("Registration Error:", err);
      let msg = t('register.error_generic');
      if (err.code === 'auth/email-already-in-use') msg = t('register.error_email_used');
      if (err.code === 'auth/weak-password') msg = t('register.error_weak_password');
      setStatus({ loading: false, error: msg });
    }
  };

  const handleGoogleRegister = async () => {
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
          birthDate: "",
          isPhoneVerified: false,
          mfaEnabled: false
        });
      }
      navigate("/");
    } catch (err) {
      console.error("Google Register Error:", err);
      setStatus({ loading: false, error: t('register.error_google') });
    }
  };

  // --- Styles ---
  const inputClass = "shadow appearance-none border border-main-bg rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-main-bg/5 transition-all";

  const customDatePickerStyle = `
    .react-datepicker-wrapper { width: 100%; }
    .react-datepicker__input-container input {
        width: 100%; height: 50px;
        background-color: rgba(255, 255, 255, 0.5);
        border: 2px solid rgba(74, 53, 47, 0.2); /* Adjusted to match Input component */
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        color: #333; outline: none;
    }
    .react-datepicker__input-container input:focus { border-color: #e48a4e; }
  `;

  // Helper component
  const PasswordRequirementItem = ({ met, text }) => (
    <div className={`flex items-center justify-end gap-3 transition-all duration-300 ${met ? "text-green-700 font-bold" : "text-gray-500"}`}>
      <span className="text-sm">{text}</span>
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] 
          ${met ? "bg-green-600 border-green-600 text-white" : "border-gray-400 bg-main-bg/5"}`}>
        {met ? "✔" : ""}
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title={t('register.title')}
        description="أنشئ حساباً جديداً في منصة كشتة واستمتع بأفضل خدمات الرحلات."
      />

      <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
        <style>{customDatePickerStyle}</style>

        <div className="max-w-2xl w-full bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-bg">

          <h2 className="text-4xl font-extrabold text-center text-main-text mb-8">
            {t('register.title')}
          </h2>

          {status.error && (
            <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-bold border border-red-200">
              {status.error}
            </p>
          )}

          <form onSubmit={handleRegister}>
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                id="firstName"
                label={t('register.first_name')}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                id="lastName"
                label={t('register.last_name')}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender & Birth Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-main-text text-base font-bold mb-2 rtl:text-right ltr:text-left">{t('register.gender')}</label>
                <select
                  id="gender"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 bg-main-bg/5 border-2 border-main-bg/20 focus:border-main-accent text-main-text hover:border-main-accent/50 focus:ring-4 focus:ring-main-accent/20"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">{t('profile.gender_male')}</option>
                  <option value="female">{t('profile.gender_female')}</option>
                </select>
              </div>

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
                    className={`${inputClass} ${ageError ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    required
                  />
                </div>
                {ageError && <p className="text-red-600 text-sm mt-1 font-bold rtl:text-right ltr:text-left">{ageError}</p>}
              </div>
            </div>

            {/* Phone Input */}
            <div className="mb-6" dir="ltr">
              <label className="block text-main-text text-base font-bold mb-2 w-full rtl:text-right ltr:text-left" dir={i18n.dir()}>{t('register.phone')}</label>
              <PhoneInput
                country={'sa'}
                value={phone}
                onChange={phone => setPhone(phone)}
                containerStyle={{ width: '100%' }}
                inputStyle={{
                  width: '100%', height: '50px', borderRadius: '0.75rem',
                  borderColor: 'rgba(74, 53, 47, 0.2)', borderWidth: '2px', backgroundColor: 'rgba(255,255,255,0.5)',
                  color: '#333', fontSize: '16px'
                }}
                buttonStyle={{
                  backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '0.75rem 0 0 0.75rem', borderColor: 'rgba(74, 53, 47, 0.2)', borderWidth: '2px 0 2px 2px'
                }}
                dropdownStyle={{ color: 'black', backgroundColor: 'white', textAlign: 'left' }}
                placeholder="5xxxxxxxx"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <Input
                id="email"
                type="email"
                label={t('register.email')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <Input
                id="password"
                type="password"
                label={t('register.password')}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                id="confirmPassword"
                type="password"
                label={t('register.confirm_password')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={formData.password !== formData.confirmPassword && formData.confirmPassword ? t('register.error_password_match') : ""}
              />
            </div>

            <div className="mb-6 mt-2 px-1">
              <div className="flex flex-col space-y-1 items-end ltr:items-start">
                <PasswordRequirementItem met={passwordCriteria.minLength} text={t('register.req_length')} />
                <PasswordRequirementItem met={passwordCriteria.hasUpperCase && passwordCriteria.hasLowerCase} text={t('register.req_case')} />
                <PasswordRequirementItem met={passwordCriteria.hasNumber} text={t('register.req_number')} />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={status.loading}
              className="w-full"
            >
              {t('register.register_btn')}
            </Button>

            <Button
              type="button"
              onClick={handleGoogleRegister}
              variant="outline"
              className="w-full mt-4 bg-main-bg/5 text-black border-gray-300 hover:bg-gray-50"
            >
              <img src={GOOGLE_ICON_URL} alt="Google" className="w-6 h-6 mr-2" />
              {t('register.google_btn')}
            </Button>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-main-text font-bold hover:text-main-accent transition-colors">{t('register.login_link')}</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;