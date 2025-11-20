import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  documentId,
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { 
  Plus, Minus, ShoppingCart, ArrowRight, Star, CheckCircle, Loader, Package, 
  MessageCircle, Send, Reply, LogIn 
} from "lucide-react";
import { subscribeToAverageRating } from "../services/ratingService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import ServiceCard from "../components/services/ServiceCard"; 

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } 
  else if (timestamp instanceof Date) {
    date = timestamp;
  } 
  else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  }
  else {
    return ""; 
  }

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " سنة";
  interval = seconds / 2592000;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " شهر";
  interval = seconds / 604800;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " أسبوع";
  interval = seconds / 86400;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " يوم";
  interval = seconds / 3600;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " ساعة";
  interval = seconds / 60;
  if (interval >= 1) return "منذ " + Math.floor(interval) + " دقيقة";
  return "الآن";
};

// 1. مكون نجوم قابل للتفاعل (للإدخال)
const StarRatingInput = ({ rating, setRating, size = 30 }) => {
  return (
    <div className="flex space-x-2 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer group transition-transform hover:scale-110">
            <input 
              type="radio" 
              className="hidden" 
              value={ratingValue} 
              onClick={() => setRating(ratingValue)}
            />
            <FaStar
              size={size}
              className={`transition-colors duration-200 ${ratingValue <= rating ? "text-main-accent" : "text-gray-300 group-hover:text-main-accent/50"}`}
            />
          </label>
        );
      })}
    </div>
  );
};

const StarsReadOnly = ({ rating, size = 16 }) => {
  return (
    <div className="flex space-x-1 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            size={size}
            className={ratingValue <= rating ? "text-main-accent" : "text-gray-300"}
          />
        );
      })}
    </div>
  );
};

function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole, userData } = useAuth();
  const { addToCart, cartItems, updateCartItemQuantity } = useCart();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPackage, setIsPackage] = useState(false);

  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [individualRatings, setIndividualRatings] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);

  const [replyText, setReplyText] = useState(""); 
  const [activeReplyId, setActiveReplyId] = useState(null); 
  const [submittingReply, setSubmittingReply] = useState(false);

  const [newCommentText, setNewCommentText] = useState("");
  const [newRatingValue, setNewRatingValue] = useState(0); // لتخزين تقييم العميل
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false); // 2. حالة التحقق من الشراء

  useEffect(() => {
    setLoading(true);
    
    const fetchAllData = async () => {
      try {
        const ratingsRef = collection(db, "ratings");
        const ratingsQuery = query(
          ratingsRef,
          where("serviceId", "==", id),
          orderBy("createdAt", "desc")
        );
        const ratingsPromise = getDocs(ratingsQuery);

        // --- التحقق من شراء العميل للخدمة ---
        if (currentUser) {
           const bookingsRef = collection(db, "bookings");
           // نبحث عن طلبات المستخدم التي تحتوي على هذه الخدمة وتكون مكتملة
           const bookingsQuery = query(
              bookingsRef, 
              where("userId", "==", currentUser.uid)
           );
           getDocs(bookingsQuery).then((snapshot) => {
              let found = false;
              snapshot.forEach(doc => {
                  const data = doc.data();
                  // نتأكد أن الحالة مكتملة وأن الخدمة موجودة في قائمة الخدمات
                  if (data.status === 'completed' && data.services?.some(item => item.serviceId === id)) {
                      found = true;
                  }
              });
              setHasPurchased(found);
           });
        }

        const history = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        const filteredHistory = history.filter((itemId) => itemId !== id);
        const newHistory = [id, ...filteredHistory];
        localStorage.setItem("recentlyViewed", JSON.stringify(newHistory.slice(0, 5)));
        
        const historyToFetch = newHistory.filter((itemId) => itemId !== id).slice(0, 3);
        let similarPromise = Promise.resolve([]); 

        if (historyToFetch.length > 0) {
            const similarQuery = query(
              collection(db, "services"),
              where(documentId(), "in", historyToFetch) 
            );
            similarPromise = getDocs(similarQuery);
        }

        let docRef = doc(db, "services", id);
        let docSnap = await getDoc(docRef);
        let foundIsPackage = false;

        if (!docSnap.exists()) {
          docRef = doc(db, "packages", id);
          docSnap = await getDoc(docRef);
          foundIsPackage = true;
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPackage(foundIsPackage);
          
          const normalizedData = {
            id: docSnap.id,
            ...data,
            name: data.name || data.title || data.packageName || data.serviceName,
            price: data.price || data.totalBasePrice,
            description: data.description,
            features: data.features || data.items || [],
            imageUrl: data.imageUrl,
          };
          setService(normalizedData);

          const [ratingsSnap, similarSnap] = await Promise.all([
            ratingsPromise,
            similarPromise
          ]);
          
          setIndividualRatings(
            ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );

          if (Array.isArray(similarSnap) === false && similarSnap.docs) { 
             const similarServicesData = similarSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
             const servicesWithRatings = await Promise.all(
               similarServicesData.map(async (simService) => {
                 const serviceRatingsRef = collection(db, "ratings");
                 const q = query(serviceRatingsRef, where("serviceId", "==", simService.id));
                 const ratingsSnapshot = await getDocs(q);
                 let totalRating = 0;
                 ratingsSnapshot.forEach((doc) => { totalRating += doc.data().rating; });
                 const count = ratingsSnapshot.size;
                 const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
                 return { ...simService, rating: parseFloat(average), ratingCount: count };
               })
             );
             const sortedServices = servicesWithRatings.sort(
               (a, b) => historyToFetch.indexOf(a.id) - historyToFetch.indexOf(b.id)
             );
             setSimilarServices(sortedServices);
          }

        } else {
          setError("لم يتم العثور على هذه الخدمة.");
        }
      } catch (err) {
        console.error("خطأ:", err);
        setError("حدث خطأ في جلب البيانات.");
      }
      setLoading(false);
    };

    fetchAllData();

    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
      setAverageRating(data);
    });
    return () => {
      unsubscribeRating();
    };
  }, [id, currentUser]); // أضفنا currentUser للمراقبة

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    
    setSubmittingComment(true);
    try {
        const newRatingData = {
            serviceId: id,
            serviceName: service.name,
            userId: currentUser.uid,
            userName: userData?.name || currentUser.email.split('@')[0] || "عميل",
            // 3. إذا اشترى المنتج نرسل التقييم، وإلا نرسل 0 (استفسار)
            rating: hasPurchased ? newRatingValue : 0, 
            comment: newCommentText,
            createdAt: serverTimestamp(),
            providerReply: null 
        };

        const docRef = await addDoc(collection(db, "ratings"), newRatingData);
        
        setIndividualRatings(prev => [{ id: docRef.id, ...newRatingData, createdAt: { toDate: () => new Date() } }, ...prev]);
        setNewCommentText("");
        setNewRatingValue(0);

    } catch (error) {
        console.error("Error adding comment:", error);
        alert("حدث خطأ أثناء الإرسال.");
    } finally {
        setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (ratingId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const ratingRef = doc(db, "ratings", ratingId);
      const replyData = {
        reply: replyText,
        repliedAt: new Date(),
        providerName: "Kashta"
      };

      await updateDoc(ratingRef, { providerReply: replyData });

      setIndividualRatings(prevRatings => 
        prevRatings.map(r => r.id === ratingId ? { ...r, providerReply: replyData } : r)
      );

      setReplyText("");
      setActiveReplyId(null);

    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const cartItem = cartItems.find((item) => item.serviceId === id);
  const isItemInCart = !!cartItem;

  const handleInitialAddToCart = () => {
    setBookingError("");
    setBookingLoading(true);
    if (!currentUser) {
      setBookingError("يجب عليك تسجيل الدخول أولاً.");
      setTimeout(() => navigate("/login"), 1500);
      setBookingLoading(false);
      return;
    }
    const itemToAdd = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: Number(service.price),
      imageUrl: service.imageUrl,
      quantity: 1,
      type: isPackage ? 'package' : 'service'
    };
    addToCart(itemToAdd);
    setBookingLoading(false);
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (cartItem) {
      updateCartItemQuantity(cartItem.cartId, newQuantity);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-main-bg"><Loader className="animate-spin text-second-text" size={48} /></div>;
  if (error || !service) return <div className="min-h-screen bg-main-bg flex flex-col items-center justify-center text-second-text"><h2 className="text-3xl font-bold mb-4">{error || "لم يتم العثور على الخدمة"}</h2><button onClick={() => navigate("/services")} className="text-main-accent underline">العودة للخدمات</button></div>;

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
          <ArrowRight className="ml-2" /> العودة للقائمة
        </button>

        {/* البطاقة الرئيسية */}
        <div className="bg-second-bg rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row mb-12">
          <div className="md:w-1/2 h-80 md:h-auto relative group">
            <img src={service.imageUrl || "https://placehold.co/600x600"} alt={service.name} fetchPriority="high" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
            {isPackage && <div className="absolute top-4 right-4 bg-main-accent text-main-text px-4 py-1 rounded-full font-bold shadow-lg flex items-center gap-2 z-10"><Package size={18} /> بكج توفير</div>}
          </div>
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-main-text leading-tight">{service.name}</h1>
              <div className="flex items-center gap-1 bg-main-text/10 px-2 py-1 rounded-lg shrink-0">
                <Star className="text-main-accent" size={16} />
                <span className="font-bold text-main-text">{averageRating.average}</span>
                <span className="text-xs text-main-text/60">({averageRating.count})</span>
              </div>
            </div>
            <p className="text-main-text/70 text-lg leading-relaxed mb-6 whitespace-pre-wrap">{service.description || "لا يوجد وصف متوفر حالياً."}</p>
            {service.features && service.features.length > 0 && (
              <div className="mb-8 bg-main-bg/5 p-4 rounded-2xl border border-main-text/5">
                <h3 className="font-bold text-main-text mb-3 border-b border-main-text/10 pb-2 text-sm uppercase tracking-wide">يشمل هذا العرض:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-main-text/90">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-medium">{typeof feature === 'object' ? feature.itemName : feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-auto pt-6 border-t border-main-text/10">
              {bookingError && <p className="bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-center text-sm font-bold">{bookingError}</p>}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-main-text/60 font-bold">السعر الإجمالي</p>
                  <p className="text-3xl font-extrabold text-main-text">{service.price} <span className="text-lg font-medium text-main-text">ريال</span></p>
                </div>
                {isItemInCart ? (
                  <div className="flex items-center gap-4 bg-main-text/10 p-2 rounded-2xl">
                     <button onClick={() => handleUpdateQuantity(cartItem.quantity - 1)} className="bg-main-text text-second-text w-10 h-10 rounded-xl hover:bg-main-bg transition flex items-center justify-center"><Minus size={20} /></button>
                     <span className="text-2xl font-bold text-main-text w-8 text-center">{cartItem.quantity}</span>
                     <button onClick={() => handleUpdateQuantity(cartItem.quantity + 1)} className="bg-main-text text-second-text w-10 h-10 rounded-xl hover:bg-main-bg transition flex items-center justify-center"><Plus size={20} /></button>
                  </div>
                ) : (
                  <button onClick={handleInitialAddToCart} disabled={bookingLoading} className="bg-main-text text-second-text px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:bg-main-bg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70">
                    <ShoppingCart size={20} /> {bookingLoading ? "جاري الإضافة..." : "أضف للسلة"}
                  </button>
                )}
              </div>
              {isItemInCart && <div className="text-center mt-3"><Link to="/cart" className="text-sm font-bold text-main-text underline hover:text-main-accent">الذهاب لإتمام الطلب</Link></div>}
            </div>
          </div>
        </div>

        {/* الخدمات المشابهة */}
        {similarServices.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-extrabold text-second-text mb-6 border-r-4 border-second-text pr-4">خدمات شاهدتها مؤخراً</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {similarServices.map((simService) => (
                <ServiceCard key={simService.id} service={simService} userRole={userRole} />
              ))}
            </div>
          </section>
        )}

        {/* --- قسم التعليقات والاستفسارات --- */}
        <section className="mt-12">
           
           <div className="bg-second-bg rounded-3xl p-6 md:p-10 shadow-xl border border-main-text/5">
             
             <div className="flex items-center justify-between mb-8 border-b border-main-text/10 pb-4">
               <h3 className="text-2xl font-extrabold text-main-text">
                 التعليقات والاستفسارات <span className="text-main-text/50 text-lg font-medium">({individualRatings.length})</span>
               </h3>
             </div>

             {/* نموذج الإضافة */}
{currentUser ? (
                <div className="bg-main-bg/5 rounded-2xl p-6 mb-10 border border-main-text/5 transition-all focus-within:border-main-text/20 focus-within:bg-main-bg/10">
                   
                   {/* --- التعديل هنا: النجوم في المنتصف وواضحة --- */}
                   {hasPurchased && (
                      <div className="flex flex-col items-center justify-center mb-6 border-b border-main-text/10 pb-6">
                         <p className="text-main-text font-bold mb-3 text-lg">كيف كانت تجربتك؟</p>
                         <StarRatingInput rating={newRatingValue} setRating={setNewRatingValue} size={35} />
                      </div>
                   )}

                   <textarea 
                     className="w-full bg-transparent text-main-text placeholder-main-text/40 border-none outline-none focus:ring-0 resize-none text-sm mb-2 font-medium"
                     placeholder={hasPurchased ? "شاركنا تفاصيل تجربتك..." : "هل لديك سؤال أو استفسار؟ اكتب هنا..."}
                     rows="3"
                     value={newCommentText}
                     onChange={(e) => setNewCommentText(e.target.value)}
                   />
                   <div className="flex justify-end items-center pt-2 border-t border-main-text/5">
                      <button 
                        onClick={handlePostComment}
                        disabled={submittingComment}
                        className="bg-main-text text-second-text px-8 py-2 rounded-xl font-bold text-sm hover:bg-main-accent hover:text-main-text transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingComment ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        إرسال
                      </button>
                   </div>
                </div>
             ) : (
                 // ... (كود غير المسجلين يبقى كما هو)
                <div className="bg-main-bg/5 rounded-2xl p-6 text-center mb-10 border border-dashed border-main-text/20">
                   <p className="text-main-text/70 text-sm mb-3 font-medium">يجب عليك تسجيل الدخول لتتمكن من المشاركة.</p>
                   <Link to="/login" className="inline-flex items-center gap-2 bg-main-text text-second-text px-6 py-2 rounded-xl font-bold text-sm hover:bg-main-accent hover:text-main-text transition">
                      <LogIn size={16} />
                      تسجيل الدخول
                   </Link>
                </div>
             )}

             {/* قائمة التعليقات */}
             <div className="space-y-8">
               {individualRatings.length > 0 ? (
                 individualRatings.map((rating) => (
                   <div key={rating.id} className="border-b border-main-text/10 pb-8 last:border-0 last:pb-0">
                     
                     <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-11 h-11 bg-main-text rounded-full flex items-center justify-center text-second-text font-bold text-lg shadow-sm">
                              {rating.userName ? rating.userName.charAt(0).toUpperCase() : "U"}
                           </div>
                           <div>
                              <h4 className="text-main-text font-bold text-base">{rating.userName || "عميل"}</h4>
                              <div className="flex items-center gap-2">
                                 <span className="text-xs text-main-text/50 font-medium">{formatTimeAgo(rating.createdAt)}</span>
                                 {/* إظهار النجوم فقط إذا كان التقييم أكبر من 0 */}
                                 {rating.rating > 0 && <StarsReadOnly rating={rating.rating} size={12} />}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pr-14">
                        <p className="text-main-text/90 text-base leading-relaxed">
                          {rating.comment}
                        </p>
                     </div>

                     {rating.providerReply && (
                       <div className="mt-4 mr-12 flex items-start gap-3 animate-fade-in">
                          <div className="w-1 border-r-2 border-main-accent/40 rounded-full h-auto"></div>
                          <div className="bg-main-bg/5 p-4 rounded-xl w-full">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-main-accent font-extrabold text-sm flex items-center gap-1.5">
                                   <CheckCircle size={14} className="fill-main-accent text-second-bg" />
                                   {rating.providerReply.providerName || "Kashta"}
                                </span>
                                <span className="text-xs text-main-text/40">
                                  {rating.providerReply.repliedAt ? formatTimeAgo(rating.providerReply.repliedAt) : ""}
                                </span>
                             </div>
                             <p className="text-main-text/80 text-sm leading-relaxed">
                               {rating.providerReply.reply}
                             </p>
                          </div>
                       </div>
                     )}

                     {!rating.providerReply && userRole === "provider" && (
                       <div className="mt-3 mr-14">
                          {activeReplyId === rating.id ? (
                            <div className="flex gap-2 mt-2 items-center animate-fade-in">
                               <input 
                                 type="text" 
                                 value={replyText}
                                 onChange={(e) => setReplyText(e.target.value)}
                                 className="bg-white text-main-text text-sm p-2.5 rounded-lg flex-1 border border-main-text/20 focus:border-main-accent outline-none shadow-inner"
                                 placeholder="اكتب الرد بصفتك Kashta..."
                               />
                               <button onClick={() => handleSubmitReply(rating.id)} className="bg-main-text text-second-text px-4 py-2 rounded-lg text-xs font-bold hover:bg-main-accent hover:text-main-text transition">إرسال</button>
                               <button onClick={() => setActiveReplyId(null)} className="text-main-text/50 text-xs hover:text-red-500 font-bold px-2">إلغاء</button>
                            </div>
                          ) : (
                            <button onClick={() => setActiveReplyId(rating.id)} className="text-xs text-main-text/40 hover:text-main-accent flex items-center gap-1 transition font-bold mt-2">
                               <Reply size={12} /> رد على العميل
                            </button>
                          )}
                       </div>
                     )}
                   </div>
                 ))
               ) : (
                 <div className="text-center py-12">
                    <MessageCircle size={48} className="text-main-text/10 mx-auto mb-3" />
                    <p className="text-main-text/60 font-medium text-lg">لا توجد تعليقات حتى الآن</p>
                    <p className="text-main-text/40 text-sm">كن أول من يشارك تجربته أو سؤاله!</p>
                 </div>
               )}
             </div>
           </div>

        </section>

      </div>
    </div>
  );
}

export default ServiceDetailPage;