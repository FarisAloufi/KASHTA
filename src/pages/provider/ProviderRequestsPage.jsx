import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import MapDisplay from "../../components/map/MapDisplay";
import { DollarSign, MapPin, Clock, Search, CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import SEO from '../../components/common/SEO';
import { useNavigate } from "react-router-dom";

function ProviderRequestsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); 
  const [requests, setRequests] = useState([]);
  const [myOffersStatus, setMyOffersStatus] = useState({}); 
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const q = query(
      collection(db, "custom_requests"),
      where("status", "==", "open"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "request_offers"),
      where("providerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statusMap = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const currentStoredStatus = statusMap[data.requestId];
        
        // (pending/accepted)
        if (currentStoredStatus !== 'pending' && currentStoredStatus !== 'accepted') {
             statusMap[data.requestId] = data.status;
        }
      });
      
      setMyOffersStatus(statusMap);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <>
      <SEO title="طلبات العملاء الخاصة" />
      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black text-second-text flex items-center gap-3">
                <Search size={36} className="text-main-accent" />
                فرص وطلبات خاصة
              </h1>
              <p className="text-second-text mt-1 opacity-80 font-medium">تصفح طلبات العملاء وقدم عروضك لزيادة دخلك</p>
            </div>
            <div className="bg-second-bg border border-main-bg px-5 py-2.5 rounded-xl text-main-text font-bold shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              متاح: {requests.length} طلبات
            </div>
          </div>

          {loading ? (
             <div className="text-center py-20 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-second-text border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-second-text font-bold">جاري البحث عن فرص...</p>
             </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-24 bg-second-bg rounded-[2.5rem] border border-main-bg text-main-text shadow-xl">
              <Search size={64} className="mx-auto text-main-text/20 mb-6" />
              <h2 className="text-2xl font-black opacity-60">لا توجد طلبات مفتوحة حالياً 😴</h2>
              <p className="text-lg opacity-40 mt-2">عد لاحقاً للتحقق من الطلبات الجديدة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {requests.map((req) => {
                const myStatus = myOffersStatus[req.id]; 
                const isPendingOrAccepted = myStatus === 'pending' || myStatus === 'accepted';
                const isRejected = myStatus === 'rejected';

                return (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/provider-requests/${req.id}`)}
                    className={`bg-second-bg rounded-[2.5rem] border overflow-hidden transition-all duration-300 group flex flex-col shadow-lg cursor-pointer ${
                        isRejected ? 'border-red-200' : 'border-main-bg hover:shadow-2xl hover:-translate-y-2'
                    }`}
                  >
                    
                    <div className="p-8 pb-4">
                      
                      {isRejected && (
                          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 animate-pulse">
                              <XCircle size={20} />
                              <span className="text-sm font-bold">تم رفض عرضك السابق، يمكنك المحاولة مرة أخرى.</span>
                          </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-[#4A3B32] text-[#E2D1B5] rounded-full flex items-center justify-center overflow-hidden font-bold text-xl border-2 border-[#E2D1B5]/20 shadow-md">
                                  {req.userImage ? (
                                      <img 
                                        src={req.userImage} 
                                        alt={req.userName} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}}
                                      />
                                  ) : (
                                      <span>{req.userName ? req.userName.charAt(0).toUpperCase() : "U"}</span>
                                  )}
                                  <span className="hidden">U</span>
                              </div>
                              <div>
                                  <h3 className="font-bold text-xl text-main-text">{req.userName}</h3>
                                  <span className="text-sm text-main-text/50 flex items-center gap-1 font-bold mt-1">
                                      <Clock size={14}/> {req.createdAt?.toDate().toLocaleDateString("ar-SA")}
                                  </span>
                              </div>
                          </div>
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl border border-green-200 shadow-sm text-center min-w-[80px]">
                             <span className="text-[10px] uppercase font-bold block opacity-60">الميزانية</span>
                             <span className="font-black text-lg">{req.budget}</span>
                          </div>
                      </div>

                      <h2 className="text-2xl font-black text-main-text mb-4 group-hover:text-main-accent transition-colors">
                          {req.title}
                      </h2>
                      <p className="text-main-text/70 text-base line-clamp-3 mb-6 leading-relaxed bg-main-bg/5 p-4 rounded-2xl border border-main-bg/5">
                          {req.description}
                      </p>
                      
                      {req.location && (
                          <div className="h-48 w-full rounded-3xl overflow-hidden border border-main-bg relative mb-2 shadow-inner pointer-events-none">
                              {/* pointer-events-none*/}
                              <div className="absolute top-3 right-3 z-10 bg-white/90 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 text-black backdrop-blur-sm">
                                  <MapPin size={14} className="text-red-600"/> موقع الكشتة
                              </div>
                              <MapDisplay location={req.location} />
                          </div>
                      )}
                    </div>

                    <div className="mt-auto bg-main-bg/5 p-6 border-t border-main-bg flex justify-end">
                      {isPendingOrAccepted ? (
                         <button 
                            disabled
                            className="bg-gray-200 text-gray-500 px-8 py-3.5 rounded-2xl font-bold w-full md:w-auto flex items-center justify-center gap-2 cursor-not-allowed border border-gray-300"
                        >
                            {myStatus === 'accepted' ? (
                                <><CheckCircle2 size={20} className="text-green-500"/> تم قبول عرضك</>
                            ) : (
                                <><CheckCircle2 size={20}/> تم التقديم</>
                            )}
                        </button>
                      ) : (
                        <button 
                            className="bg-main-text text-second-text px-8 py-3.5 rounded-2xl font-bold group-hover:bg-main-accent group-hover:text-white transition-all w-full md:w-auto flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            {isRejected ? (
                                <><AlertCircle size={20}/> تقديم عرض جديد</>
                            ) : (
                                <>التفاصيل وتقديم عرض <ArrowRight size={20} className="rtl:rotate-180"/></>
                            )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProviderRequestsPage;