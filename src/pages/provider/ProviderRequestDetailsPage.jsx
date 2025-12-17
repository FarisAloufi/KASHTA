import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import MapDisplay from "../../components/map/MapDisplay";
import { DollarSign, MapPin, Clock, Send, User, ArrowRight, CheckCircle2, XCircle, AlertCircle, Hash } from "lucide-react";
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';

function ProviderRequestDetailsPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [requestData, setRequestData] = useState(null);
  const [myOffer, setMyOffer] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [offerForm, setOfferForm] = useState({ price: "", message: "" });

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const reqRef = doc(db, "custom_requests", id);
        const reqSnap = await getDoc(reqRef);
        
        if (reqSnap.exists()) {
          setRequestData({ id: reqSnap.id, ...reqSnap.data() });
        } else {
          toast.error("الطلب غير موجود");
          navigate("/provider-requests");
          return;
        }

        const q = query(
          collection(db, "request_offers"),
          where("requestId", "==", id),
          where("providerId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const offerData = snapshot.docs[0].data();
            setMyOffer({ id: snapshot.docs[0].id, ...offerData });
          } else {
            setMyOffer(null);
          }
          setLoading(false);
        });

        return unsubscribe;

      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, navigate]);

  // 2. إرسال العرض
  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "request_offers"), {
        requestId: requestData.id,
        requestTitle: requestData.title,
        providerId: currentUser.uid,
        providerName: userData?.name || currentUser.displayName || "مقدم خدمة",
        providerImage: userData?.photoURL || currentUser?.photoURL || null, 
        providerEmail: currentUser.email,
        price: Number(offerForm.price),
        message: offerForm.message,
        status: "pending",
        createdAt: serverTimestamp()
      });

      toast.success("تم إرسال عرضك بنجاح! 🚀");
      setOfferForm({ price: "", message: "" }); 
    } catch (error) {
      console.error("Error sending offer:", error);
      toast.error("حدث خطأ أثناء إرسال العرض");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-main-bg flex items-center justify-center text-second-text font-bold">جاري التحميل...</div>;
  if (!requestData) return null;

  const isRejected = myOffer?.status === 'rejected';
  const canSubmit = !myOffer || isRejected; 

  return (
    <>
      <SEO title={`تفاصيل الطلب: ${requestData.title}`} />
      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
            
          <button onClick={() => navigate(-1)} className="flex items-center text-second-text/70 mb-8 hover:text-second-text transition font-bold gap-2 group">
            <ArrowRight className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" size={20} /> رجوع للقائمة
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-second-bg p-8 rounded-[2.5rem] shadow-2xl border border-main-bg relative overflow-hidden">
                    
                    <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-main-bg pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#4A3B32] text-[#E2D1B5] rounded-full flex items-center justify-center overflow-hidden font-bold text-2xl border-4 border-[#E2D1B5]/20 shadow-md">
                                {requestData.userImage ? (
                                    <img src={requestData.userImage} alt={requestData.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{requestData.userName ? requestData.userName.charAt(0).toUpperCase() : "U"}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-main-text">{requestData.userName || "عميل"}</h2>
                                <div className="flex items-center gap-2 text-main-text/60 text-xs font-bold mt-1">
                                    <Clock size={14}/> 
                                    {requestData.createdAt?.toDate().toLocaleDateString("ar-SA")}
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-left">
                            <span className="block text-xs text-main-text/60 font-bold mb-1">الميزانية المقترحة</span>
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-black text-lg border border-green-200 inline-block">
                                {requestData.budget} ريال
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-main-text mb-4">{requestData.title}</h1>
                        <div className="bg-main-bg/5 p-6 rounded-3xl border border-main-bg/10">
                            <p className="text-lg text-main-text/80 leading-relaxed font-medium">
                                {requestData.description}
                            </p>
                        </div>
                    </div>

                    {requestData.location && (
                        <div className="rounded-3xl overflow-hidden border border-main-bg shadow-sm">
                            <div className="bg-main-bg/10 px-6 py-3 flex items-center gap-2 font-bold text-main-text">
                                <MapPin size={18} className="text-red-500"/> موقع الكشتة المطلوب
                            </div>
                            <div className="h-64 w-full relative">
                                <MapDisplay location={requestData.location} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-second-bg p-6 rounded-[2.5rem] shadow-xl border border-main-bg sticky top-28">
                    
                    <h3 className="text-2xl font-black text-main-text mb-6 flex items-center gap-2">
                        <Send size={24} className="text-main-accent"/> تقديم عرض
                    </h3>

                    {isRejected && (
                        <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                            <XCircle className="text-red-500 shrink-0" size={24} />
                            <div>
                                <p className="font-bold text-red-800">تم رفض عرضك السابق</p>
                                <p className="text-xs text-red-600 mt-1">لكن لا تقلق، يمكنك تقديم عرض سعر جديد ومنافس الآن!</p>
                            </div>
                        </div>
                    )}

                    {myOffer?.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center mb-4">
                            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-green-800">تم قبول عرضك! 🎉</h2>
                            <p className="text-green-600 text-sm mt-2">يمكنك متابعة الطلب في صفحة الحجوزات.</p>
                        </div>
                    )}

                    {myOffer?.status === 'pending' && (
                        <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl text-center mb-4">
                            <Clock size={48} className="text-amber-500 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-xl font-bold text-amber-800">تم إرسال العرض</h2>
                            <p className="text-amber-600 text-sm mt-2">بانتظار موافقة العميل...</p>
                            <div className="mt-4 pt-4 border-t border-amber-200/50 flex justify-between text-sm text-amber-900 font-bold">
                                <span>سعرك المقدم:</span>
                                <span>{myOffer.price} ريال</span>
                            </div>
                        </div>
                    )}

                    {canSubmit && (
                        <form onSubmit={handleSubmitOffer} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-main-text mb-2">سعرك المقترح (ريال)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        placeholder="00"
                                        className="w-full bg-main-bg/5 border border-main-bg/10 focus:border-main-accent rounded-2xl px-5 py-4 font-bold text-xl focus:outline-none transition-all text-main-text pl-12"
                                        value={offerForm.price}
                                        onChange={(e) => setOfferForm({...offerForm, price: e.target.value})}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-main-text/40 font-bold text-sm">SAR</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-main-text mb-2">رسالة للعميل (مهم جداً)</label>
                                <textarea 
                                    rows="4"
                                    placeholder="اكتب تفاصيل عرضك هنا... مثلاً: السعر يشمل التجهيز والقهوة والشاي..."
                                    className="w-full bg-main-bg/5 border border-main-bg/10 focus:border-main-accent rounded-2xl px-5 py-4 focus:outline-none transition-all text-main-text resize-none font-medium text-sm"
                                    value={offerForm.message}
                                    onChange={(e) => setOfferForm({...offerForm, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full bg-main-text text-second-text py-4 rounded-2xl font-black text-lg hover:bg-main-accent hover:text-white transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? "جاري الإرسال..." : (
                                    <>
                                        إرسال العرض <Send size={20} className="rtl:rotate-180"/>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProviderRequestDetailsPage;