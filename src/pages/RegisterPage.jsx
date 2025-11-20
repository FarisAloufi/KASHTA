import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("ذكر");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);


    if (!firstName || !lastName || !phone || !birthDate) {
      setError("الرجاء تعبئة جميع الحقول.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;


      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: user.email,
        phone: phone,
        gender: gender,
        birthDate: birthDate,
        role: "customer",
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      console.error("خطأ في إنشاء الحساب:", err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مسجل مسبقاً.");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      } else {
        setError("حدث خطأ. الرجاء المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
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
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          firstName: user.displayName.split(" ")[0] || "",
          lastName: user.displayName.split(" ")[1] || "",
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
      setError("حدث خطأ أثناء إنشاء الحساب عبر Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
      <div className="max-w-2xl w-full bg-second-bg rounded-3xl shadow-2xl p-8 md:p-12 border border-main-bg/10">
        <h2 className="text-4xl font-extrabold text-center text-main-text mb-8">
          إنشاء حساب جديد
        </h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-bold">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الاسم الأول</label>
              <input
                className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الاسم الأخير</label>
              <input
                className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">الجنس</label>
              <select
                className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-main-text text-base font-bold mb-2 text-right">تاريخ الميلاد</label>
              <input
                className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
          </div>


          <div className="mb-6">
            <label className="block text-main-text text-base font-bold mb-2 text-right">رقم الجوال</label>
            <div className="flex direction-ltr">
              <input
                className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50 text-left"
                type="tel"
                placeholder="50xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <span className="flex items-center justify-center px-4 bg-main-bg/10 border border-main-text/20 rounded-xl mr-2 font-bold text-main-text">
                +966
              </span>
            </div>
          </div>


          <div className="mb-6">
            <label className="block text-main-text text-base font-bold mb-2 text-right">البريد الإلكتروني</label>
            <input
              className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-main-text text-base font-bold mb-2 text-right">كلمة المرور</label>
            <input
              className="shadow appearance-none border border-main-text/20 rounded-xl w-full py-3 px-4 text-main-text focus:ring-2 focus:ring-main-accent outline-none bg-white/50"
              type="password"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="bg-main-text text-second-text w-full font-bold py-4 rounded-2xl hover:bg-main-accent hover:text-main-text transition-all shadow-lg disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>


          <button
            onClick={handleGoogleRegister}
            type="button"
            className="bg-white mt-4 text-black px-7 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-105 transition-all w-full flex items-center justify-center gap-3 border border-gray-300"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
            إنشاء حساب عبر Google
          </button>

          <Link
            to="/login"
            className="inline-block text-center w-full mt-6 font-bold text-main-text hover:text-main-accent underline"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;