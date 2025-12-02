import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, updateDoc, serverTimestamp, documentId } from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { Plus, Minus, ShoppingCart, ArrowRight, Star, CheckCircle, Loader, Package, MessageCircle, Send, Reply, LogIn, Briefcase, ShieldCheck, Sparkles } from "lucide-react";
import { subscribeToAverageRating } from "../services/ratingService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ServiceCard from "../components/services/ServiceCard";
import ProviderInfoCard from "../components/services/ProviderInfoCard";

// === Helper Functions ===
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  let date;
  if (timestamp?.toDate) date = timestamp.toDate();
  else if (timestamp instanceof Date) date = timestamp;
  else if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
  else return "";
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

const StarsReadOnly = ({ rating, size = 16 }) => {
  return (
    <div className="flex gap-0.5" dir="rtl">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={ratingValue}
            fill={ratingValue <= rating ? "#ffc107" : "none"}
            stroke={ratingValue <= rating ? "#ffc107" : "#d1d5db"}
            size={size}
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

  // Comment & Reply states
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [newRatingValue, setNewRatingValue] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasRatedBefore, setHasRatedBefore] = useState(false);

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

        if (currentUser) {
          const bookingsRef = collection(db, "bookings");
          const bookingsQuery = query(
            bookingsRef,
            where("userId", "==", currentUser.uid)
          );
          getDocs(bookingsQuery).then((snapshot) => {
            let found = false;
            snapshot.forEach(doc => {
              const data = doc.data();
              if (data.status === 'completed' && data.services?.some(item => item.serviceId === id)) {
                found = true;
              }
            });
            setHasPurchased(found);
          });

          const userRatingQuery = query(
            collection(db, "ratings"),
            where("serviceId", "==", id),
            where("userId", "==", currentUser.uid),
            where("rating", ">", 0)
          );
          getDocs(userRatingQuery).then((snapshot) => {
            if (!snapshot.empty) {
              setHasRatedBefore(true);
            }
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
            providerId: data.providerId
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
                ratingsSnapshot.forEach((doc) => {
                  totalRating += doc.data().rating;
                });
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
  }, [id, currentUser]);

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);
    try {
      const ratingToSend = (hasPurchased && !hasRatedBefore) ? newRatingValue : 0;
      const newRatingData = {
        serviceId: id,
        serviceName: service.name,
        userId: currentUser.uid,
        userName: userData?.name || currentUser.email.split('@')[0] || "عميل",
        rating: ratingToSend,
        comment: newCommentText,
        createdAt: serverTimestamp(),
        providerReply: null
      };

      const docRef = await addDoc(collection(db, "ratings"), newRatingData);
      setIndividualRatings(prev => [{ id: docRef.id, ...newRatingData, createdAt: { toDate: () => new Date() } }, ...prev]);

      if (ratingToSend > 0) setHasRatedBefore(true);

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
      const replyName = userRole === 'admin' ? "Kashta" : (userData?.name || "مقدم خدمة");
      const replyData = {
        reply: replyText,
        repliedAt: new Date(),
        providerName: replyName
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
      type: isPackage ? 'package' : 'service',
      providerId: service.providerId
    };
    addToCart(itemToAdd);
    setBookingLoading(false);
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (cartItem) {
      updateCartItemQuantity(cartItem.cartId, newQuantity);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-main-bg"><Loader className="animate-spin text-main-accent" size={40} /></div>;
  if (error || !service) return <div className="min-h-screen flex flex-col justify-center items-center bg-main-bg text-main-text"><p className="text-xl font-bold mb-4">{error || "لم يتم العثور على الخدمة"}</p><button onClick={() => navigate("/services")} className="text-main-accent underline">العودة للخدمات</button></div>;

  const canReply = userRole === "admin" || (userRole === "provider" && currentUser && service.providerId === currentUser.uid);

  return (
    <div className="min-h-screen bg-main-bg pt-28 pb-20 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold">
          <ArrowRight className="ml-2" size={20} />
          العودة للقائمة
        </button>

        <section className="flex justify-center w-full">
          <div className="w-full max-w-6xl bg-second-bg rounded-3xl shadow-xl overflow-hidden border border-main-text/5">


            <div className="relative h-[400px] md:h-[500px] w-full group">
              <img
                src={service.imageUrl || "https://placehold.co/800x600"}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />


              <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 text-white z-10">
                {isPackage && (
                  <span className="inline-flex items-center gap-1.5 bg-main-accent text-main-text text-xs md:text-sm px-4 py-1.5 rounded-full font-black mb-3 shadow-lg">
                    <Package size={14} /> بكج توفير
                  </span>
                )}
                <h1 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-md">{service.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                    <Star className="text-main-accent fill-main-accent" size={16} />
                    <span className="font-bold text-lg pt-0.5">{averageRating.average}</span>
                    <span className="text-white/70 text-sm">({averageRating.count} تقييم)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-12">


              <div className="mb-12">
                <div className="prose prose-lg prose-invert max-w-none">
                  <h3 className="text-main-text font-bold text-xl mb-3 flex items-center gap-2">
                    <Sparkles size={20} className="text-main-accent" />
                    الوصف
                  </h3>
                  <p className="text-main-text/80 leading-loose text-base md:text-lg">
                    {service.description || "لا يوجد وصف متوفر حالياً."}
                  </p>
                </div>

                {service.features?.length > 0 && (
                  <div className="mt-8 bg-main-bg/5 rounded-2xl p-6 border border-main-text/5">
                    <p className="text-main-text font-bold mb-4 text-lg">مميزات العرض:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-main-text/90 bg-second-bg/50 p-3 rounded-xl border border-main-text/5">
                          <CheckCircle size={18} className="text-main-accent shrink-0" />
                          <span className="font-medium text-sm md:text-base">{typeof feature === "object" ? feature.itemName : feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <div className="mt-10 p-1 rounded-2xl bg-gradient-to-br from-main-text/5 to-main-accent/10">
                  <div className="bg-second-bg rounded-xl p-6 md:p-8 border border-main-text/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                      <div className="text-center md:text-right">
                        <p className="text-main-text/60 text-sm font-medium mb-1">السعر الإجمالي</p>
                        <div className="flex items-center justify-center md:justify-start gap-1">
                          <span className="text-main-text font-black text-4xl">{service.price}</span>
                          <span className="text-main-accent font-bold text-lg mt-2">ريال</span>
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex-1 max-w-md">
                        {bookingError && (
                          <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-xl text-center font-bold mb-4 animate-pulse">
                            {bookingError}
                          </div>
                        )}

                        {isItemInCart ? (
                          <div className="flex items-center gap-3 bg-main-bg/10 p-2 rounded-2xl border border-main-text/10">
                            <button onClick={() => handleUpdateQuantity(cartItem.quantity - 1)} className="bg-main-text text-second-text w-12 h-12 rounded-xl flex items-center justify-center hover:bg-main-text/90 transition shadow-md">
                              <Minus size={20} />
                            </button>
                            <span className="font-black text-2xl flex-1 text-center text-main-text">{cartItem.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(cartItem.quantity + 1)} className="bg-main-text text-second-text w-12 h-12 rounded-xl flex items-center justify-center hover:bg-main-text/90 transition shadow-md">
                              <Plus size={20} />
                            </button>
                            <Link to="/cart" className="bg-main-accent text-main-text px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition shadow-lg flex-1">
                              إتمام الطلب <ArrowRight size={18} />
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={handleInitialAddToCart}
                            disabled={bookingLoading}
                            className="group relative w-full bg-main-text text-second-text py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-main-text/20 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 overflow-hidden flex items-center justify-center gap-3"
                          >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                            {bookingLoading ? (
                              <><Loader className="animate-spin" size={24} /> جاري الإضافة...</>
                            ) : (
                              <>
                                <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                <span>أضف للسلة</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="h-full">
                  {service.providerId && <ProviderInfoCard providerId={service.providerId} />}
                </div>

                <div className="bg-main-accent/5 border border-main-accent/10 rounded-2xl p-6 flex flex-col justify-center h-full">
                  <div className="flex items-start gap-4">
                    <div className="bg-main-accent text-main-text p-3 rounded-full shadow-md shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-main-text text-lg mb-2">ضمان كشتة الذهبي</h4>
                      <p className="text-main-text/70 text-sm leading-relaxed">
                        رحلتك مضمونة 100%. في حال اختلاف الخدمة عن الوصف، نضمن لك استعادة كامل المبلغ. دعم فني متواجد 24/7 لخدمتك.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {similarServices.length > 0 && (
                <div className="mb-16 pt-10 border-t border-main-text/5">
                  <h2 className="text-main-text font-extrabold text-2xl mb-6">
                    خدمات قد تعجبك
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {similarServices.map((simService) => (
                      <ServiceCard key={simService.id} service={simService} />
                    ))}
                  </div>
                </div>
              )}


              <div className="pt-10 border-t border-main-text/10">
                <h3 className="text-2xl font-bold text-main-text mb-8 flex items-center gap-2">
                  <MessageCircle className="text-main-accent" />
                  آراء العملاء ({individualRatings.length})
                </h3>

                {currentUser ? (
                  <div className="bg-second-bg rounded-2xl p-6 mb-10 border border-main-text/10 shadow-sm">
                    {hasPurchased && !hasRatedBefore && (
                      <div className="mb-4 pb-4 border-b border-main-text/5">
                        <label className="block text-main-text text-sm font-bold mb-3">قيّم تجربتك</label>
                        <div className="flex gap-2" dir="rtl">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              size={28}
                              className={`cursor-pointer transition-all hover:scale-110 ${index + 1 <= newRatingValue ? "text-yellow-400 drop-shadow-sm" : "text-gray-300"}`}
                              onClick={() => setNewRatingValue(index + 1)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        className="w-full bg-white text-main-text rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-main-accent/50 outline-none resize-none border border-transparent transition placeholder:text-main-text/30"
                        placeholder="اكتب تعليقك هنا..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                      />
                      <button
                        onClick={handlePostComment}
                        disabled={submittingComment}
                        className="absolute bottom-3 left-3 bg-main-text text-second-text px-4 py-2 rounded-lg font-bold text-xs hover:bg-main-accent hover:text-main-text transition disabled:opacity-50 flex items-center gap-2 shadow-md"
                      >
                        {submittingComment ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                        نشر
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-main-bg/5 rounded-2xl p-8 text-center mb-10 border border-dashed border-main-text/20">
                    <p className="text-main-text/70 text-base mb-4 font-medium">سجل دخولك لتشاركنا رأيك في الخدمة</p>
                    <Link to="/login" className="inline-flex items-center gap-2 bg-main-text text-second-text px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-main-accent hover:text-main-text transition shadow-md hover:-translate-y-0.5">
                      <LogIn size={18} />
                      تسجيل الدخول
                    </Link>
                  </div>
                )}

                <div className="space-y-6">
                  {individualRatings.length > 0 ? (
                    individualRatings.map((rating) => (
                      <div key={rating.id} className="bg-main-bg/5 p-6 rounded-2xl border border-main-text/5 hover:border-main-text/10 transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-main-text to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {rating.userName ? rating.userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <h4 className="text-main-text font-bold text-base">{rating.userName || "عميل"}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                {rating.rating > 0 && <StarsReadOnly rating={rating.rating} size={14} />}
                                <span className="text-xs text-main-text/40 font-medium">• {formatTimeAgo(rating.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mr-16">
                          <p className="text-main-text/80 text-base leading-relaxed">{rating.comment}</p>
                        </div>

                        {/* رد المزود */}
                        {rating.providerReply && (
                          <div className="mt-4 mr-12 md:mr-16 flex items-start gap-3 animate-fade-in">
                            <div className="w-0.5 bg-main-accent/30 rounded-full self-stretch my-1"></div>
                            <div className="bg-second-bg p-4 rounded-xl w-full border border-main-text/5 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-main-accent font-extrabold text-sm flex items-center gap-1.5">
                                  {rating.providerReply.providerName === "Kashta" ? (
                                    <CheckCircle size={14} className="fill-main-accent text-second-bg" />
                                  ) : (
                                    <Briefcase size={14} className="text-main-accent" />
                                  )}
                                  {rating.providerReply.providerName}
                                </span>
                                <span className="text-xs text-main-text/30">
                                  {rating.providerReply.repliedAt ? formatTimeAgo(rating.providerReply.repliedAt) : ""}
                                </span>
                              </div>
                              <p className="text-main-text/70 text-sm leading-relaxed">{rating.providerReply.reply}</p>
                            </div>
                          </div>
                        )}


                        {!rating.providerReply && canReply && (
                          <div className="mt-4 mr-16">
                            {activeReplyId === rating.id ? (
                              <div className="flex gap-2 items-center bg-white p-2 rounded-xl shadow-sm ring-1 ring-main-text/5">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="bg-transparent text-main-text text-sm p-2 flex-1 outline-none"
                                  placeholder="اكتب ردك..."
                                  autoFocus
                                />
                                <button onClick={() => handleSubmitReply(rating.id)} className="bg-main-text text-second-text px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-main-accent hover:text-main-text transition">إرسال</button>
                                <button onClick={() => setActiveReplyId(null)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"><Minus size={14} /></button>
                              </div>
                            ) : (
                              <button onClick={() => setActiveReplyId(rating.id)} className="text-xs text-main-text/40 hover:text-main-accent flex items-center gap-1 transition font-bold">
                                <Reply size={12} />
                                رد على العميل
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-main-bg/5 rounded-3xl border border-dashed border-main-text/10">
                      <MessageCircle size={48} className="text-main-text/10 mx-auto mb-4" />
                      <p className="text-main-text/60 font-bold text-lg">لا توجد تعليقات حتى الآن</p>
                      <p className="text-main-text/40 text-sm mt-1">كن أول من يشارك تجربته مع هذه الخدمة!</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default ServiceDetailPage;