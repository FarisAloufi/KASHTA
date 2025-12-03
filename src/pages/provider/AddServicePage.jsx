import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { 
  Image as ImageIcon, Upload, Loader, CheckCircle, AlertCircle, Eye, X, Package, Layers, ArrowRight, DollarSign, FileText, Tag 
} from "lucide-react";
import ServiceCard from "../../components/services/ServiceCard"; 

function AddServicePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPackage, setIsPackage] = useState(false); // Toggles between Service and Package mode

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "general", 
    description: "",
    featuresInput: ""
  });

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // --- Form Submission Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Basic Validation
    if (!formData.name || !formData.price || !formData.description) {
      setError("الرجاء تعبئة جميع الحقول المطلوبة.");
      return;
    }

    if (!imageFile) {
      setError("الرجاء إرفاق صورة.");
      return;
    }

    setLoading(true);

    try {
      // 2. Upload Image to Firebase Storage
      const imageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(imageRef, imageFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 3. Process Features (Split by new line)
      const featuresArray = formData.featuresInput
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");

      // 4. Prepare Common Data
      const baseData = {
        category: formData.category,
        description: formData.description,
        imageUrl: downloadUrl,
        providerId: currentUser.uid,
        providerName: currentUser.displayName || "مقدم خدمة",
        createdAt: serverTimestamp(),
        rating: 0,
        ratingCount: 0
      };

      // 5. Save to Firestore based on Type (Package vs Service)
      if (isPackage) {
        await addDoc(collection(db, "packages"), {
          ...baseData,
          packageName: formData.name,
          totalBasePrice: Number(formData.price),
          items: featuresArray,
        });
      } else {
        await addDoc(collection(db, "services"), {
          ...baseData,
          name: formData.name,
          price: Number(formData.price),
          features: featuresArray,
        });
      }

      setSuccess(isPackage ? "تم نشر البكج بنجاح!" : "تم نشر الخدمة بنجاح!");
      
      // 6. Redirect after success
      setTimeout(() => {
        navigate("/services");
      }, 2000);

    } catch (err) {
      console.error("Error adding service:", err);
      setError("حدث خطأ أثناء النشر، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // --- Live Preview Object ---
  const previewService = {
    id: "preview",
    name: formData.name || (isPackage ? "عنوان البكج..." : "عنوان الخدمة..."),
    price: formData.price || "0",
    imageUrl: imagePreview,
    rating: 5,
    ratingCount: 0,
    description: formData.description || "سيظهر وصف الخدمة هنا بشكل مختصر وجذاب للعميل...",
    features: formData.featuresInput ? formData.featuresInput.split("\n").filter(f => f) : [],
    isPackage: isPackage
  };

  // Common Styles
  const inputClasses = "w-full p-4 rounded-xl border border-main-text/10 focus:border-main-accent focus:ring-2 focus:ring-main-accent/20 outline-none bg-main-bg/5 text-main-text placeholder-main-text/30 transition-all font-bold text-sm";
  const labelClasses = "block text-main-text font-bold mb-2 text-sm flex items-center gap-2";

  return (
    <div className="min-h-screen bg-main-bg pt-28 pb-20 px-4 md:px-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
          <ArrowRight className="ml-2" size={20} />
          العودة للخلف
        </button>

        <section className="flex justify-center w-full">
            <div className="w-full bg-second-bg rounded-3xl shadow-xl overflow-hidden border border-main-text/5">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
                    
                    {/* === Right Side: Input Form === */}
                    <div className="lg:col-span-7 p-8 md:p-12 order-2 lg:order-1">
                        
                        <div className="mb-8">
                           <h1 className="text-3xl font-black text-main-text mb-2 flex items-center gap-2">
                             {isPackage ? <Package className="text-main-accent" size={32} /> : <Layers className="text-main-accent" size={32} />}
                             {isPackage ? "إضافة بكج جديد" : "إضافة خدمة جديدة"}
                           </h1>
                           <p className="text-main-text/60 font-medium">املأ البيانات التالية لعرض خدمتك في التطبيق</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Type Toggle Buttons */}
                            <div className="flex bg-main-bg/10 p-1.5 rounded-2xl border border-main-text/10 mb-6">
                                <button
                                type="button"
                                onClick={() => setIsPackage(false)}
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                                    !isPackage 
                                    ? "bg-main-text text-second-bg shadow-md scale-[1.02]" // Active Style (Brown)
                                    : "text-main-text/70 hover:bg-main-text/10"
                                }`}
                                >
                                <Layers size={20} className={!isPackage ? "text-main-accent" : ""} /> خدمة فردية
                                </button>
                                <button
                                type="button"
                                onClick={() => setIsPackage(true)}
                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                                    isPackage 
                                    ? "bg-main-text text-second-bg shadow-md scale-[1.02]" // Active Style (Brown)
                                    : "text-main-text/70 hover:bg-main-text/10"
                                }`}
                                >
                                <Package size={20} className={isPackage ? "text-main-accent" : ""} /> بكج توفير
                                </button>
                            </div>
                            
                            {/* Alerts */}
                            {error && (
                                <div className="bg-red-500/10 text-red-600 p-4 rounded-xl font-bold text-sm border border-red-500/20 flex items-center gap-2 animate-pulse">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 text-green-600 p-4 rounded-xl font-bold text-sm border border-green-500/20 flex items-center gap-2 animate-bounce">
                                    <CheckCircle size={18} /> {success}
                                </div>
                            )}

                            {/* Service Name */}
                            <div>
                                <label className={labelClasses}>
                                    <FileText size={16} className="text-main-accent" />
                                    {isPackage ? "اسم البكج" : "اسم الخدمة"}
                                </label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={isPackage ? "مثال: بكج الشواء الملكي" : "مثال: جلسة أرضية فاخرة"}
                                    className={inputClasses}
                                />
                            </div>

                            {/* Price & Category */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>
                                        <DollarSign size={16} className="text-main-accent" />
                                        السعر (ريال)
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>
                                        <Tag size={16} className="text-main-accent" />
                                        التصنيف
                                    </label>
                                    <select 
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className={`${inputClasses} cursor-pointer appearance-none`}
                                    >
                                        <option value="general">عام</option>
                                        <option value="sea">بحر 🌊</option>
                                        <option value="land">بر ⛺</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className={labelClasses}>
                                    <ImageIcon size={16} className="text-main-accent" />
                                    صورة العرض
                                </label>
                                {!imagePreview ? (
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-main-text/10 rounded-2xl cursor-pointer bg-main-bg/5 hover:bg-main-bg/10 hover:border-main-accent/50 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="bg-main-bg/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-main-text/60" />
                                            </div>
                                            <p className="text-sm font-bold text-main-text/60">اضغط لرفع صورة عالية الدقة</p>
                                            <p className="text-xs text-main-text/40 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-main-text/10 group shadow-sm">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={removeImage} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transform scale-95 group-hover:scale-100 transition-all">
                                                <X size={16} /> حذف الصورة
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClasses}>
                                    وصف تفصيلي
                                </label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="اكتب وصفاً جذاباً يشرح تفاصيل الخدمة..."
                                    className={`${inputClasses} resize-none h-32 leading-relaxed`}
                                />
                            </div>

                            {/* Features List */}
                            <div>
                                <label className="block text-main-text font-bold mb-2 text-sm flex justify-between items-center">
                                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-main-accent" /> {isPackage ? "محتويات البكج" : "المميزات الإضافية"}</span>
                                    <span className="text-[10px] bg-main-text/10 px-2 py-1 rounded text-main-text/60">كل ميزة في سطر جديد</span>
                                </label>
                                <textarea 
                                    name="featuresInput"
                                    value={formData.featuresInput}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder={isPackage ? "خيمة 4x4\nفرشات ومساند\nإضاءة ليد\nقهوة وشاي" : "توصيل مجاني\nضمان نظافة"}
                                    className={`${inputClasses} resize-none h-32 leading-relaxed`}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-main-text text-second-text py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:shadow-main-text/20 hover:bg-main-accent hover:text-main-text transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {loading ? <Loader className="animate-spin" /> : <CheckCircle size={24} />}
                                    {loading ? "جاري النشر..." : "نشر الخدمة الآن"}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* === Left Side: Live Preview === */}
                    <div className="lg:col-span-5 bg-main-bg/5 p-8 md:p-12 border-t lg:border-t-0 lg:border-r border-main-text/10 flex flex-col items-center justify-start order-1 lg:order-2">
                        <div className="sticky top-24 w-full max-w-[340px]">
                            <div className="text-center mb-8">
                                <span className="bg-white/80 backdrop-blur border border-main-text/5 text-main-text px-5 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 w-fit mx-auto shadow-sm">
                                    <Eye size={16} className="text-main-accent" /> معاينة حية للإعلان
                                </span>
                            </div>
                            
                            {/* Card Preview */}
                            <div className="transform transition-all duration-500 hover:scale-[1.02]"> 
                                <ServiceCard service={previewService} userRole="customer" />
                            </div>
                            
                            <div className="mt-8 text-center space-y-2">
                                <p className="text-main-text/40 text-sm font-medium">هكذا سيظهر كرت الخدمة للعملاء في صفحة الخدمات</p>
                                <div className="flex justify-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-main-text/20"></div>
                                    <div className="w-1 h-1 rounded-full bg-main-text/20"></div>
                                    <div className="w-1 h-1 rounded-full bg-main-text/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

      </div>
    </div>
  );
}

export default AddServicePage;