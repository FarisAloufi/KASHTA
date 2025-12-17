import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Clock, Plus, FileText, Loader, ChevronLeft } from "lucide-react";
import SEO from '../../components/common/SEO';
import { useTranslation } from "react-i18next";

function MyCustomRequestsPage() {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "custom_requests"),
      where("userId", "==", currentUser.uid),
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
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="w-12 h-12 text-second-text animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-second-text">{t('common.loading')}</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={t('custom_requests.my_requests_title')} />
      <div className="bg-main-bg min-h-screen pt-28 pb-10 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-second-text flex items-center gap-3">
                <FileText size={36} className="text-main-accent" />
                {t('custom_requests.my_requests_title')}
                </h1>
                <p className="text-second-text mt-1 font-medium opacity-80">تتبع حالة طلباتك الخاصة والعروض المقدمة</p>
            </div>

            <Link to="/create-request" className="bg-second-bg text-main-text border border-main-bg hover:bg-main-accent hover:text-second-text transition-all duration-300 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1">
              <Plus size={20} /> {t('custom_requests.new_req_btn')}
            </Link>
          </div>

          {/* Requests Grid */}
          {requests.length === 0 ? (
             <div className="text-center bg-second-bg text-main-text p-16 rounded-3xl shadow-lg border border-main-bg mt-10">
                <FileText size={64} className="mx-auto text-main-text/20 mb-6" />
                <h2 className="text-2xl font-black mb-4">{t('custom_requests.no_reqs')}</h2>
                <p className="text-lg text-main-text/70 mb-8 max-w-md mx-auto">
                    لم تقم بإنشاء أي طلب خاص حتى الآن. ابدأ بتصميم كشتتك الخاصة!
                </p>
                <Link to="/create-request" className="inline-block bg-main-text text-second-text px-8 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-transform">
                    {t('custom_requests.new_req_btn')}
                </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {requests.map((req) => (
                <Link 
                  key={req.id} 
                  to={`/my-requests/${req.id}`}
                  className="block bg-second-bg p-6 rounded-3xl shadow-md border border-main-bg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'open' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-200 text-gray-700 border border-gray-300'
                        }`}>
                          {req.status === 'open' ? t('status.open_for_offers') : t('status.closed')}
                    </div>
                    <Clock size={16} className="text-main-text/40" />
                  </div>

                  <h3 className="text-xl font-black text-main-text mb-2 group-hover:text-main-accent transition-colors line-clamp-1">
                    {req.title}
                  </h3>
                  <p className="text-sm text-main-text/60 line-clamp-2 mb-6 h-10 leading-relaxed font-medium">
                      {req.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-main-text/10 pt-4 mt-auto">
                    <span className="flex items-center gap-1 text-xs font-bold text-main-text/50">
                        {req.createdAt?.toDate().toLocaleDateString(i18n.language === 'ar' ? "ar-SA" : "en-US")}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-black text-main-text group-hover:translate-x-[-5px] rtl:group-hover:translate-x-[5px] transition-transform">
                        التفاصيل <ChevronLeft size={16} className="rtl:rotate-180" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyCustomRequestsPage;