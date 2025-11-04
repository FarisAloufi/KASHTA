import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function RegisterPage() {
  const [name, setName] = useState(''); // *** 1. تمت إضافة State للاسم ***
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // *** 2. تمت إضافة التحقق من الاسم ***
    if (!name) {
        setError('الرجاء إدخال اسمك الكامل.');
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // *** 3. تمت إضافة الاسم هنا عند حفظ المستخدم ***
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name, // حفظ الاسم
        email: user.email,
        role: "customer", 
        createdAt: new Date()
      });

      console.log("تم إنشاء الحساب بنجاح");
      navigate('/');

    } catch (err) {
      console.error("خطأ في إنشاء الحساب:", err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      } else {
        setError('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A352F] p-6">
      <div className="max-w-md w-full bg-[#d8ceb8ff] rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center text-black mb-8">إنشاء حساب جديد</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>

          {/* *** 4. تمت إضافة خانة الاسم الكامل هنا *** */}
          <div className="mb-6">
            <label className="block text-black text-base font-semibold mb-2 text-right" htmlFor="name">
              الاسم الكامل
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" 
              id="name"
              type="text"
              placeholder="مثال: أحمد محمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-black text-base font-semibold mb-2 text-right" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" 
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-black text-base font-semibold mb-2 text-right" htmlFor="password">
              كلمة المرور
            </label>
            <input
          className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col items-center">
            <button
              className="bg-black text-white px-7 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300 focus:shadow-outline w-full text-lg transition shadow-md"
              type="submit"
            >
              إنشاء الحساب
            </button>
            <Link to="/login" className="inline-block align-baseline font-semibold text-base text-[#3e2723] hover:text-[#e48a4e] font-medium transition-colors duration-200 mt-4">
              لديك حساب بالفعل؟ تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;