import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import { doc, collection, query, where, onSnapshot, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import MapDisplay from "../../components/map/MapDisplay";
import { DollarSign, ShieldCheck, Clock, MapPin, ArrowRight, CheckCircle2, Hash, XCircle, User } from "lucide-react";
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';
import { useTranslation } from "react-i18next";

function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [requestData, setRequestData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubReq = onSnapshot(doc(db, "custom_requests", id), (doc) => {
      if (doc.exists()) {
        setRequestData({ id: doc.id, ...doc.data() });
      }
    });

    const q = query(collection(db, "request_offers"), where("requestId", "==", id));
    const unsubOffers = onSnapshot(q, (snapshot) => {
      const offersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(offersList);
      setLoading(false);
    });

    return () => {
      unsubReq();
      unsubOffers();
    };
  }, [id]);

  const handleAcceptOffer = async (offer) => {
    if(!window.confirm(t('custom_requests.confirm_accept_msg'))) return;

    try {
      await updateDoc(doc(db, "custom_requests", id), {
        status: "accepted",
        acceptedOfferId: offer.id,
        acceptedProviderId: offer.providerId
      });

      await updateDoc(doc(db, "request_offers", offer.id), {
        status: "accepted"
      });

      const numericOrderId = Math.floor(10000000 + Math.random() * 90000000).toString();
      await addDoc(collection(db, "bookings"), {
        orderGroupId: numericOrderId,
        userId: requestData.userId,
        userName: requestData.userName,
        items: [{
            serviceId: id,
            serviceName: `${t('custom_requests.special_req_prefix')}: ${requestData.title}`,
            servicePrice: Number(offer.price),
            quantity: 1,
            providerId: offer.providerId,
            status: 'pending'
        }],
        bookingDate: new Date().toISOString(),
        location: requestData.location,
        status: 'pending',
        createdAt: serverTimestamp(),
        totalPrice: Number(offer.price),
        type: 'custom_request'
      });

      toast.success(t('custom_requests.accept_success'));
      navigate("/my-bookings");

    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error(t('custom_requests.accept_error'));
    }
  };

  const handleRejectOffer = async (offer) => {
    if(!window.confirm("هل أنت متأكد من رفض هذا العرض؟ سيتمكن المزود من تقديم عرض جديد.")) return;

    try {
      await updateDoc(doc(db, "request_offers", offer.id), {
        status: "rejected"
      });
      toast.success("تم رفض العرض بنجاح");
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error("حدث خطأ أثناء رفض العرض");
    }
  };

  if (loading || !requestData) return <div className="min-h-screen bg-main-bg flex items-center justify-center text-second-text font-bold text-xl">{t('common.loading')}...</div>;

  return (
    <>
      <SEO title={`${t('custom_requests.details_title')}: ${requestData.title}`} />
      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-4xl">
            
          <button onClick={() => navigate(-1)} className="flex items-center text-second-text/70 mb-8 hover:text-second-text transition font-bold gap-2 group">
            <ArrowRight className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" size={20} /> {t('common.back')}
          </button>

          <div className="bg-second-bg p-8 rounded-[2.5rem] shadow-2xl border border-main-bg relative overflow-hidden">
            
           <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b-2 border-dashed border-main-bg pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-main-bg text-second-bg p-2 rounded-lg shadow-sm">
                            <Hash size={24} />
                        </span>
                        <div>
                            <p className="text-xs text-main-text/60 font-bold">معرف الطلب</p>
                            <h1 className="text-2xl font-black text-main-text font-mono tracking-wide">{requestData.id.slice(0,8)}</h1>
                        </div>
                    </div>
                    <span className={`inline-block px-5 py-2 rounded-xl text-sm font-bold shadow-sm ${
                        requestData.status === 'open' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                        {requestData.status === 'open' ? t('status.open') : t('status.accepted')}
                    </span>
                </div>
            </div>
            
            <div className="mb-8 bg-main-bg/5 p-6 rounded-3xl border border-main-bg/10">
                <h3 className="text-sm font-bold text-main-text/50 uppercase mb-3">تفاصيل الطلب</h3>
                <h2 className="text-xl font-black text-main-text mb-2">{requestData.title}</h2>
                <p className="text-lg text-main-text/80 leading-relaxed font-medium">
                    {requestData.description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-second-bg border border-main-bg p-6 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-main-bg text-second-text flex items-center justify-center shadow-md">
                        <DollarSign size={24}/>
                    </div>
                    <div>
                        <span className="block text-xs text-main-text/60 font-bold uppercase">{t('custom_requests.budget_label')}</span>
                        <span className="font-black text-main-text text-xl">{requestData.budget} <span className="text-sm">{t('services.currency')}</span></span>
                    </div>
                </div>
                <div className="bg-second-bg border border-main-bg p-6 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-main-bg text-second-text flex items-center justify-center shadow-md">
                        <Clock size={24}/>
                    </div>
                    <div>
                        <span className="block text-xs text-main-text/60 font-bold uppercase">تاريخ الإنشاء</span>
                        <span className="font-black text-main-text text-lg">{requestData.createdAt?.toDate().toLocaleDateString(i18n.language === 'ar' ? "ar-SA" : "en-US")}</span>
                    </div>
                </div>
            </div>

            {requestData.location && (
                <div className="bg-second-bg p-2 rounded-3xl border border-main-bg shadow-sm mb-12">
                    <div className="h-64 w-full rounded-[1.2rem] overflow-hidden border border-main-bg shadow-inner relative">
                        <MapDisplay location={requestData.location} />
                        <div className="absolute top-3 right-3 z-10 bg-white/90 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 text-black backdrop-blur-sm">
                            <MapPin size={14} className="text-red-600"/> {t('custom_requests.location_label')}
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t-2 border-dashed border-main-bg pt-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-main-text flex items-center gap-3">
                        <ShieldCheck className="text-main-accent" size={32}/> 
                        {t('custom_requests.provider_offers')} 
                    </h2>
                    <span className="bg-main-accent text-second-text px-4 py-1 rounded-full font-bold shadow-sm">
                        {offers.length} عروض
                    </span>
                </div>
                
                {offers.length === 0 ? (
                    <div className="bg-main-bg/5 p-12 rounded-[2rem] text-center border-2 border-dashed border-main-bg/20">
                        <Clock size={56} className="mx-auto text-main-text/20 mb-4 animate-pulse"/>
                        <p className="text-main-text/50 font-bold text-lg">{t('custom_requests.waiting_offers')}...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {offers.map((offer) => (
                            <div key={offer.id} className={`bg-second-bg p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                                requestData.acceptedOfferId === offer.id 
                                ? 'border-green-500 shadow-lg ring-2 ring-green-500/20 bg-green-50/10' 
                                : offer.status === 'rejected'
                                ? 'border-red-200 bg-red-50/10 opacity-75'
                                : 'border-main-bg hover:shadow-xl hover:-translate-y-1'
                            }`}>
                                {requestData.status === 'accepted' && requestData.acceptedOfferId === offer.id && (
                                    <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 rounded-br-2xl text-xs font-bold flex items-center gap-1 shadow-sm z-10">
                                        <CheckCircle2 size={14} /> تم قبول العرض
                                    </div>
                                )}

                                {offer.status === 'rejected' && (
                                    <div className="absolute top-0 left-0 bg-red-500 text-white px-4 py-1 rounded-br-2xl text-xs font-bold flex items-center gap-1 shadow-sm z-10">
                                        <XCircle size={14} /> تم رفض العرض
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-[#4A3B32] text-[#E2D1B5] rounded-full flex items-center justify-center overflow-hidden font-bold text-2xl border-4 border-[#E2D1B5]/20 shrink-0 shadow-md">
                                            {offer.providerImage ? (
                                                <img 
                                                    src={offer.providerImage} 
                                                    alt={offer.providerName} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}}
                                                />
                                            ) : (
                                                <span>{offer.providerName ? offer.providerName.charAt(0).toUpperCase() : "P"}</span>
                                            )}
                                            <span className="hidden">P</span>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-main-text text-xl">{offer.providerName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex text-yellow-500">★★★★★</div>
                                                <span className="text-xs text-main-text/40 font-bold">(5.0)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                                        <div className="text-3xl font-black text-main-text">
                                            {offer.price} <span className="text-sm font-bold text-main-text/60">{t('services.currency')}</span>
                                        </div>
                                        
                                        {requestData.status === 'open' ? (
                                            offer.status === 'rejected' ? (
                                                <span className="text-red-500 font-bold text-sm px-4 py-2 bg-red-50 rounded-xl border border-red-100 flex items-center gap-1">
                                                    <XCircle size={16}/> مرفوض
                                                </span>
                                            ) : (
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button 
                                                        onClick={() => handleRejectOffer(offer)}
                                                        className="bg-red-50 text-red-600 px-5 py-3 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100 flex-1 sm:flex-none text-sm"
                                                    >
                                                        رفض
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAcceptOffer(offer)}
                                                        className="bg-main-text text-second-text px-6 py-3 rounded-xl font-bold hover:bg-main-accent hover:text-white transition-all shadow-lg hover:shadow-xl flex-1 sm:flex-none text-sm"
                                                    >
                                                        {t('custom_requests.accept_btn')}
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            requestData.acceptedOfferId !== offer.id && (
                                                <span className="text-main-text/40 font-bold text-sm px-4 py-2 bg-main-bg/5 rounded-lg">لم يتم القبول</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {offer.message && (
                                    <div className="mt-6 bg-main-bg/5 p-4 rounded-2xl border border-main-text/5 flex items-start gap-3">
                                        <div className="mt-1 text-main-text/40"><User size={16}/></div>
                                        <p className="text-main-text/80 leading-relaxed font-medium italic">
                                            "{offer.message}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default RequestDetailsPage;