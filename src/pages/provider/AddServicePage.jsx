import React, { useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AddServicePage() {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || price <= 0 || !imageUrl || !description) {
      setError("الرجاء ملء جميع الحقول بسعر صحيح.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "services"), {
        name: name,
        price: Number(price),
        imageUrl: imageUrl,
        description: description,
        createdAt: serverTimestamp(),
        providerId: currentUser.uid,
      });

      setSuccess("تمت إضافة الخدمة بنجاح!");

      setName("");
      setPrice(0);
      setImageUrl("");
      setDescription("");

      setTimeout(() => {
        navigate("/services");
      }, 2000);
    } catch (err) {
      console.error("خطأ في إضافة الخدمة:", err);
      setError("حدث خطأ أثناء إضافة الخدمة.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-second-bg text-main-text rounded-3xl shadow-2xl p-10 border border-main-bg/10">
        <h1 className="text-4xl font-extrabold text-center text-main-text mb-10">
          إضافة خدمة جديدة
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 text-center font-medium">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-main-text text-base font-semibold mb-2 text-right"
              htmlFor="name"
            >
              اسم الخدمة (مثل: خيمة )
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-main-text text-base font-semibold mb-2 text-right"
              htmlFor="description"
            >
              وصف الخدمة
            </label>
            <textarea
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل الخيمة، مساحتها، والملحقات المرفقة..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-main-text text-base font-semibold mb-2 text-right"
                htmlFor="price"
              >
                السعر (بالريال)
              </label>
              <input
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                className="block text-main-text text-base font-semibold mb-2 text-right"
                htmlFor="imageUrl"
              >
                رابط صورة الخدمة (Cloudinary)
              </label>
              <input
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                id="imageUrl"
                type="text"
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-center pt-4">
            <button
              className="w-full bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري الإضافة..." : "إضافة الخدمة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServicePage;
