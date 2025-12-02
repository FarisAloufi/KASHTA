import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
  collection, query, where, getDocs, doc, updateDoc, orderBy
} from "firebase/firestore";
import {
  Users, ShoppingBag, CheckCircle, XCircle, TrendingUp,
  ShieldCheck, Briefcase, FileText, Calendar, Loader
} from "lucide-react";


const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-second-bg p-6 rounded-2xl shadow-lg border border-main-text/10 flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-4 rounded-full ${color} text-white shadow-md`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-main-text/60 text-sm font-bold mb-1">{title}</p>
      <h3 className="text-2xl font-black text-main-text">{value}</h3>
    </div>
  </div>
);

function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    providersCount: 0,
    bookingsCount: 0,
    totalRevenue: 0
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {

        const usersSnap = await getDocs(collection(db, "users"));
        const bookingsSnap = await getDocs(collection(db, "bookings"));

        let users = 0;
        let providers = 0;
        let revenue = 0;

        usersSnap.forEach(doc => {
          const role = doc.data().role;
          if (role === 'provider') providers++;
          else users++;
        });

        bookingsSnap.forEach(doc => {
          revenue += Number(doc.data().totalPrice || 0);
        });

        setStats({
          usersCount: users,
          providersCount: providers,
          bookingsCount: bookingsSnap.size,
          totalRevenue: revenue
        });


        const appsQuery = query(
          collection(db, "providerApplications"),
          where("status", "==", "pending"),
          orderBy("submittedAt", "desc")
        );
        const appsSnap = await getDocs(appsQuery);
        const appsData = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setApplications(appsData);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleApprove = async (app) => {
    if (!window.confirm(`هل أنت متأكد من قبول "${app.fullName}"؟`)) return;
    setProcessingId(app.id);

    try {
      await updateDoc(doc(db, "providerApplications", app.id), {
        status: "approved",
        reviewedAt: new Date()
      });


      if (app.uid) {
        await updateDoc(doc(db, "users", app.uid), {
          role: "provider"
        });
      }

      setApplications(prev => prev.filter(item => item.id !== app.id));
      alert("تم قبول مقدم الخدمة بنجاح! 🎉");

    } catch (error) {
      console.error("Error approving:", error);
      alert("حدث خطأ أثناء العملية.");
    } finally {
      setProcessingId(null);
    }
  };


  const handleReject = async (appId) => {
    if (!window.confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    setProcessingId(appId);

    try {
      await updateDoc(doc(db, "providerApplications", appId), {
        status: "rejected",
        reviewedAt: new Date()
      });

      setApplications(prev => prev.filter(item => item.id !== appId));

    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg py-10 px-4">
      <div className="container mx-auto max-w-7xl">

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2 flex items-center gap-3">
            <ShieldCheck size={40} /> لوحة تحكم الإدارة
          </h1>
          <p className="text-second-text/70">نظرة عامة على أداء المنصة والطلبات الجديدة</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="إجمالي المبيعات"
            value={`${stats.totalRevenue.toLocaleString()} ريال`}
            icon={TrendingUp}
            color="bg-green-600"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={stats.bookingsCount}
            icon={ShoppingBag}
            color="bg-blue-600"
          />
          <StatCard
            title="العملاء المسجلين"
            value={stats.usersCount}
            icon={Users}
            color="bg-orange-500"
          />
          <StatCard
            title="مقدمي الخدمات"
            value={stats.providersCount}
            icon={Briefcase}
            color="bg-purple-600"
          />
        </div>


        <div className="bg-second-bg rounded-3xl p-8 shadow-xl border border-main-text/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-main-text flex items-center gap-2">
              <FileText /> طلبات الانضمام الجديدة
            </h2>
            <span className="bg-main-text text-second-text px-3 py-1 rounded-full text-sm font-bold">
              {applications.length} معلق
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-main-bg/5 rounded-2xl border-2 border-dashed border-main-text/20">
              <p className="text-main-text/60 font-bold text-lg">لا توجد طلبات جديدة حالياً ✅</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white/50 p-6 rounded-2xl border border-main-text/10 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 right-0 w-2 bg-main-accent"></div>

                  <div className="mr-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-main-text">{app.fullName}</h3>
                        <p className="text-sm text-main-text/60 font-mono">{app.email}</p>
                      </div>
                      <span className="bg-main-bg/10 text-main-text px-3 py-1 rounded-lg text-xs font-bold">
                        {app.nationality}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-6 bg-main-bg/5 p-4 rounded-xl">
                      <div>
                        <p className="text-main-text/50 font-bold mb-1">رقم الهوية</p>
                        <p className="font-mono font-bold text-main-text">{app.idNumber}</p>
                      </div>
                      <div>
                        <p className="text-main-text/50 font-bold mb-1">رقم الجوال</p>
                        <p className="font-mono font-bold text-main-text" dir="ltr">{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-main-text/50 font-bold mb-1">تاريخ الميلاد</p>
                        <div className="flex items-center gap-1 font-bold text-main-text">
                          <Calendar size={14} /> {app.birthDate}
                        </div>
                      </div>
                      <div>
                        <p className="text-main-text/50 font-bold mb-1">السجل التجاري</p>
                        <p className={`font-bold ${app.hasCommercialRecord ? "text-green-600" : "text-red-500"}`}>
                          {app.hasCommercialRecord ? "موجود ✅" : "غير متوفر ❌"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(app)}
                        disabled={processingId === app.id}
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 disabled:opacity-50 shadow-md"
                      >
                        {processingId === app.id ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        قبول وترقية
                      </button>

                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={processingId === app.id}
                        className="flex-1 bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-200 transition flex justify-center items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle size={18} /> رفض
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;