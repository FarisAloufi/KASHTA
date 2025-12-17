import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { MapPin, ArrowRight, Loader, PenTool } from "lucide-react";
import SEO from '../../components/common/SEO';
import MapPicker from "../../components/map/MapPicker";
import { useTranslation } from "react-i18next";

function CreateRequestPage() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });

  useEffect(() => {
    if (currentUser) {
      if (userData?.name || currentUser.displayName) {
        setPageReady(true);
      } else {
        const timer = setTimeout(() => setPageReady(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!selectedLocation) {
      alert(t('custom_requests.location_error'));
      return;
    }

    setLoading(true);

    try {
      const finalName = userData?.name || currentUser.displayName || t('common.client');
      const finalImage = userData?.photoURL || currentUser.photoURL || null;

      await addDoc(collection(db, "custom_requests"), {
        userId: currentUser.uid,
        userName: finalName, 
        userImage: finalImage,
        userEmail: currentUser.email,
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        location: selectedLocation, 
        status: "open",
        acceptedBy: null,
        createdAt: serverTimestamp()
      });

      navigate("/my-requests");
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!pageReady && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <Loader className="w-12 h-12 text-second-text animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO title={t('custom_requests.new_req_page_title')} />
      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          
          <button onClick={() => navigate(-1)} className="flex items-center text-second-text/70 mb-8 hover:text-second-text transition font-bold gap-2 group">
            <ArrowRight className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" size={20} /> {t('common.back')}
          </button>

          <div className="bg-second-bg rounded-[2.5rem] shadow-2xl border border-main-bg p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8 border-b border-main-text/10 pb-6">
                 <div className="w-14 h-14 bg-main-bg/10 rounded-2xl flex items-center justify-center text-main-text shadow-sm">
                    <PenTool size={28} />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-black text-main-text">{t('custom_requests.form_title')}</h1>
                    <p className="text-main-text/60 text-sm font-medium mt-1">املأ التفاصيل للحصول على أفضل العروض من مزودينا</p>
                 </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label className="block text-main-text font-bold mb-2 text-sm">{t('custom_requests.label_title')}</label>
                <input 
                    type="text" 
                    required
                    placeholder="مثال: كشتة عائلية 10 أشخاص"
                    className="w-full bg-main-bg/5 border border-main-bg/10 focus:border-main-accent rounded-2xl py-4 px-5 text-main-text placeholder-main-text/30 focus:outline-none transition-all font-bold text-lg"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                
                <div>
                <label className="block text-main-text font-bold mb-2 text-sm">{t('custom_requests.label_desc')}</label>
                <textarea 
                    required
                    rows="4"
                    placeholder="اذكر جميع التفاصيل والمتطلبات..."
                    className="w-full bg-main-bg/5 border border-main-bg/10 focus:border-main-accent rounded-2xl py-4 px-5 text-main-text placeholder-main-text/30 resize-none focus:outline-none transition-all font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                </div>

                <div>
                <label className="block text-main-text font-bold mb-2 text-sm">{t('custom_requests.label_budget')}</label>
                <input 
                    type="number" 
                    placeholder="00"
                    className="w-full bg-main-bg/5 border border-main-bg/10 focus:border-main-accent rounded-2xl py-4 px-5 text-main-text placeholder-main-text/30 focus:outline-none transition-all font-bold text-lg"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                </div>

                <div>
                <label className="block text-main-text font-bold mb-2 text-sm flex items-center gap-2">
                    <MapPin size={16} className="text-main-accent"/> {t('custom_requests.label_location')}
                </label>
                <div className="h-72 w-full rounded-3xl overflow-hidden border-4 border-main-bg/10 relative z-0">
                    <MapPicker onLocationChange={setSelectedLocation} mode="set" />
                </div>
                {selectedLocation && (
                    <p className="text-sm text-emerald-600 mt-3 font-bold flex items-center gap-2 bg-emerald-50 w-fit px-3 py-1 rounded-lg border border-emerald-100">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                        {t('custom_requests.location_success')}
                    </p>
                )}
                </div>

                <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-main-text text-second-text font-black py-4 rounded-2xl hover:bg-main-accent hover:text-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 mt-6 flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:hover:translate-y-0"
                >
                {loading ? <Loader className="animate-spin" /> : t('custom_requests.submit_btn')}
                </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateRequestPage;