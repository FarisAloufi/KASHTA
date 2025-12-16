import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { translateText } from "../../utils/googleTranslate";
import {
  Image as ImageIcon, Upload, CheckCircle, AlertCircle, Eye, X,
  Package, Layers, ArrowRight, DollarSign, FileText, Tag, Languages, Plus
} from "lucide-react";

// --- Components ---
import ServiceCard from "../../components/services/ServiceCard";
import Button from "../../components/common/Button";
import SEO from '../../components/common/SEO';

function AddServicePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inputError, setInputError] = useState(""); 
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPackage, setIsPackage] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    price: "",
    category: "general",
    descriptionAr: "",
    descriptionEn: "",
  });

  // Feature Input State
  const [featureAr, setFeatureAr] = useState("");
  const [featureEn, setFeatureEn] = useState("");
  const [featuresList, setFeaturesList] = useState([]);

  // --- Regex Validators ---
  const containsEnglish = (text) => /[a-zA-Z]/.test(text);
  const containsArabic = (text) => /[\u0600-\u06FF]/.test(text);

  const setTranslatedError = async (baseMessage) => {
    try {
      const translatedMsg = await translateText(baseMessage, i18n.language);
      setInputError(translatedMsg);
    } catch (err) {
      setInputError(baseMessage);
    }
  };

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputError(""); 

    if (name === "nameAr" || name === "descriptionAr") {
      if (containsEnglish(value)) {
        setTranslatedError("عذراً: هذا الحقل مخصص للغة العربية فقط.");
        return; 
      }
    }

    if (name === "nameEn" || name === "descriptionEn") {
      if (containsArabic(value)) {
        setTranslatedError("Sorry: This field accepts English characters only.");
        return; 
      }
    }

    if (name === "price") {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureArChange = (e) => {
    const val = e.target.value;
    setInputError("");
    if (containsEnglish(val)) {
      setTranslatedError("عذراً: ميزة (عربي) تقبل العربية فقط.");
      return;
    }
    setFeatureAr(val);
  };

  const handleFeatureEnChange = (e) => {
    const val = e.target.value;
    setInputError("");
    if (containsArabic(val)) {
      setTranslatedError("Sorry: Feature (English) accepts English characters only.");
      return;
    }
    setFeatureEn(val);
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

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (featureAr.trim() && featureEn.trim()) {
      setFeaturesList([...featuresList, { ar: featureAr, en: featureEn }]);
      setFeatureAr("");
      setFeatureEn("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nameAr || !formData.nameEn || !formData.price || !formData.descriptionAr || !formData.descriptionEn) {
      setError(t('add_service.error_required'));
      return;
    }

    if (!imageFile) {
      setError(t('add_service.error_image'));
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(storage, `services/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(imageRef, imageFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      const baseData = {
        category: formData.category,
        description: { ar: formData.descriptionAr, en: formData.descriptionEn },
        imageUrl: downloadUrl,
        providerId: currentUser.uid,
        providerName: currentUser.displayName || t('service_detail.provider_name'),
        providerEmail: currentUser.email,
        createdAt: serverTimestamp(),
        rating: 0,
        ratingCount: 0,
        type: isPackage ? 'package' : 'service'
      };

      if (isPackage) {
        await addDoc(collection(db, "packages"), {
          ...baseData,
          packageName: { ar: formData.nameAr, en: formData.nameEn },
          totalBasePrice: Number(formData.price),
          items: featuresList,
        });
      } else {
        await addDoc(collection(db, "services"), {
          ...baseData,
          name: { ar: formData.nameAr, en: formData.nameEn },
          price: Number(formData.price),
          features: featuresList,
        });
      }

      setSuccess(t('add_service.success_msg'));

      setTimeout(() => {
        navigate("/manage-bookings");
      }, 2000);

    } catch (err) {
      console.error("Error adding service:", err);
      setError(t('add_service.error_saving'));
    } finally {
      setLoading(false);
    }
  };

  // --- Live Preview ---
  const currentLang = i18n.language;
  const previewService = {
    id: "preview",
    name: currentLang === 'en' ? (formData.nameEn || "English Title") : (formData.nameAr || "العنوان بالعربي"),
    packageName: currentLang === 'en' ? (formData.nameEn || "English Title") : (formData.nameAr || "العنوان بالعربي"),
    price: Number(formData.price) || 0,
    totalBasePrice: Number(formData.price) || 0,
    imageUrl: imagePreview,
    rating: 5,
    ratingCount: 0,
    description: currentLang === 'en' ? (formData.descriptionEn || "Service description...") : (formData.descriptionAr || "وصف الخدمة..."),
    features: featuresList,
    items: featuresList,
    type: isPackage ? 'package' : 'service'
  };

  // Styles
  const labelClasses = "block text-main-text font-bold mb-2 text-sm flex items-center gap-2";
  const dualSectionClasses = "bg-main-bg/10 p-5 rounded-2xl border border-main-bg mb-6";
  const inputClasses = "w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 bg-main-bg/5 border-2 border-main-bg/20 focus:border-main-accent text-main-text placeholder:text-main-text/40 hover:border-main-accent/50 focus:ring-4 focus:ring-main-accent/20";

  return (
    <>
      <SEO
        title={t('navbar.add_service')}
        description="أضف خدمة أو باقة جديدة لمنصة كشتة."
      />

      <div className="min-h-screen bg-main-bg pt-28 pb-20 px-4 md:px-8 relative">
        <div className="max-w-6xl mx-auto">

          <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
            <ArrowRight className="ml-2 rtl:rotate-180" size={20} />
            {t('common.back')}
          </button>

          <section className="flex justify-center w-full">
            <div className="w-full bg-second-bg rounded-3xl shadow-xl overflow-hidden border border-main-bg">

              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">

                {/* === Right Side: Input Form === */}
                <div className="lg:col-span-7 p-8 md:p-12 order-2 lg:order-1">

                  <div className="mb-8">
                    <h1 className="text-3xl font-black text-main-text mb-2 flex items-center gap-2">
                      {isPackage ? <Package className="text-main-accent" size={32} /> : <Layers className="text-main-accent" size={32} />}
                      {isPackage ? t('add_service.package_title') : t('add_service.service_title')}
                    </h1>
                    <p className="text-main-text/60 font-medium">{t('add_service.subtitle')}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Type Toggle */}
                    <div className="flex bg-main-bg/10 p-1.5 rounded-2xl border border-main-bg mb-6">
                      <button type="button" onClick={() => setIsPackage(false)} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${!isPackage ? "bg-main-text text-second-bg shadow-md scale-[1.02]" : "text-main-text/70 hover:bg-main-text/10"}`}>
                        <Layers size={20} className={!isPackage ? "text-main-accent" : ""} /> {t('services.tab_individual')}
                      </button>
                      <button type="button" onClick={() => setIsPackage(true)} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isPackage ? "bg-main-text text-second-bg shadow-md scale-[1.02]" : "text-main-text/70 hover:bg-main-text/10"}`}>
                        <Package size={20} className={isPackage ? "text-main-accent" : ""} /> {t('services.tab_packages')}
                      </button>
                    </div>

                    {/* Alerts */}
                    {inputError && <div className="bg-yellow-500/10 text-yellow-600 p-3 rounded-xl font-bold text-sm border border-yellow-500/20 mb-4 animate-shake flex items-center gap-2"><AlertCircle size={18} /> {inputError}</div>}
                    {error && <div className="bg-red-500/10 text-red-600 p-4 rounded-xl font-bold text-sm border border-red-500/20 flex items-center gap-2 animate-pulse"><AlertCircle size={18} /> {error}</div>}
                    {success && <div className="bg-green-500/10 text-green-600 p-4 rounded-xl font-bold text-sm border border-green-500/20 flex items-center gap-2 animate-bounce"><CheckCircle size={18} /> {success}</div>}

                    {/* Name (Dual) */}
                    <div className={dualSectionClasses}>
                      <label className={labelClasses}>
                        <FileText size={16} className="text-main-accent" />
                        {isPackage ? t('add_service.pkg_name') : t('add_service.srv_name')}
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="nameAr"
                          value={formData.nameAr}
                          onChange={handleChange}
                          placeholder={t('add_service.placeholder_ar')}
                          dir="rtl"
                          className={inputClasses}
                        />
                        <input
                          type="text"
                          name="nameEn"
                          value={formData.nameEn}
                          onChange={handleChange}
                          placeholder={t('add_service.placeholder_en')}
                          dir="ltr"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    {/* Price & Category */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={labelClasses}>
                          <DollarSign size={16} className="text-main-accent" />
                          {t('add_service.price')}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="0"
                          className={inputClasses}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>
                          <Tag size={16} className="text-main-accent" />
                          {t('add_service.category')}
                        </label>
                        <select
                          name="category" value={formData.category} onChange={handleChange}
                          className={`${inputClasses} cursor-pointer appearance-none`}
                        >
                          <option value="general">{t('services.filter_all')}</option>
                          <option value="sea">{t('services.filter_sea')}</option>
                          <option value="land">{t('services.filter_land')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Description (Dual) */}
                    <div className={dualSectionClasses}>
                      <label className={labelClasses}>
                        <Languages size={16} className="text-main-accent" />
                        {t('add_service.description')}
                      </label>
                      <div className="space-y-4">
                        <textarea
                          name="descriptionAr" value={formData.descriptionAr} onChange={handleChange} rows="3"
                          placeholder="وصف تفصيلي بالعربي..."
                          className={`${inputClasses} resize-none`}
                          dir="rtl"
                        />
                        <textarea
                          name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} rows="3"
                          placeholder="Detailed description in English..."
                          className={`${inputClasses} resize-none`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className={dualSectionClasses}>
                      <label className="block text-main-text font-bold mb-3 text-sm flex justify-between items-center">
                        <span className="flex items-center gap-2"><CheckCircle size={16} className="text-main-accent" /> {isPackage ? t('add_service.contents') : t('add_service.features')}</span>
                      </label>

                      <div className="flex flex-col md:flex-row gap-2 mb-3 items-end">
                        <input
                          value={featureAr}
                          onChange={handleFeatureArChange}
                          placeholder="ميزة (عربي)"
                          dir="rtl"
                          className={inputClasses}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFeature(e)}
                        />
                        <input
                          value={featureEn}
                          onChange={handleFeatureEnChange}
                          placeholder="Feature (English)"
                          dir="ltr"
                          className={inputClasses}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFeature(e)}
                        />
                        <Button onClick={handleAddFeature} type="button" className="px-4 py-3 shadow-md h-[52px]" variant="primary">
                          <Plus size={20} />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 min-h-[50px] bg-main-bg/5 p-3 rounded-xl border border-dashed border-main-bg">
                        {featuresList.length === 0 && <span className="text-main-text/30 text-xs p-1">{t('add_service.no_features')}</span>}
                        {featuresList.map((feat, index) => (
                          <div key={index} className="bg-main-accent/10 text-main-accent pl-2 pr-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 group border border-main-accent/20">
                            <button type="button" onClick={() => handleRemoveFeature(index)} className="hover:bg-red-500 hover:text-white rounded-full p-0.5 transition">
                              <X size={12} />
                            </button>
                            <div className="flex flex-col leading-tight text-right">
                              <span>{feat.ar}</span>
                              <span className="text-[10px] opacity-70">{feat.en}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className={labelClasses}>
                        <ImageIcon size={16} className="text-main-accent" />
                        {t('add_service.image')}
                      </label>
                      {!imagePreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-main-bg rounded-2xl cursor-pointer bg-main-bg/5 hover:bg-main-bg/10 hover:border-main-accent/50 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="bg-main-bg/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-main-text/60" />
                            </div>
                            <p className="text-sm font-bold text-main-text/60">{t('add_service.click_upload')}</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-main-bg group shadow-sm">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={removeImage} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transform scale-95 group-hover:scale-100 transition-all">
                              <X size={16} /> {t('common.confirm_delete')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full text-lg py-4 shadow-xl"
                        icon={!loading ? CheckCircle : undefined}
                      >
                        {t('add_service.submit')}
                      </Button>
                    </div>

                  </form>
                </div>

                {/* Left Side: Preview */}
                <div className="lg:col-span-5 bg-main-bg/5 p-8 md:p-12 border-t lg:border-t-0 lg:border-r border-main-bg flex flex-col items-center justify-start order-1 lg:order-2">
                  <div className="sticky top-24 w-full max-w-[340px]">
                    <div className="text-center mb-8">
                      <span className="bg-white/80 backdrop-blur border border-main-bg text-main-text px-5 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 w-fit mx-auto shadow-sm">
                        <Eye size={16} className="text-main-accent" /> {t('add_service.preview')}
                      </span>
                    </div>
                    <div className="transform transition-all duration-500 hover:scale-[1.02]">
                      <ServiceCard service={previewService} userRole="customer" />
                    </div>
                    <div className="mt-8 text-center space-y-2">
                      <p className="text-main-text/40 text-sm font-medium">{t('add_service.preview_note')}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

export default AddServicePage;