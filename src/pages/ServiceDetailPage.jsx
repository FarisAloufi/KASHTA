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
} from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { Plus, Minus } from "lucide-react";
import { subscribeToAverageRating } from "../services/ratingService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import ServiceCard from "../components/services/ServiceCard"; 

import RatingForm from "../components/orders/RatingForm";
import DisplayRating from "../components/orders/DisplayRating";

const StarsReadOnly = ({ rating, size = 20 }) => {
  const filledColor = "#ffc107";
  const emptyColor = "#a3a3a3ff";

  return (
    <div className="flex space-x-1 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            size={size}
            color={ratingValue <= rating ? filledColor : emptyColor}
          />
        );
      })}
    </div>
  );
};

function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const { addToCart, cartItems, updateCartItemQuantity } = useCart();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [individualRatings, setIndividualRatings] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchServiceAndRatings = async () => {
      try {
        const serviceDocRef = doc(db, "services", id);
        const docSnap = await getDoc(serviceDocRef);

        if (docSnap.exists()) {
          const serviceData = { id: docSnap.id, ...docSnap.data() };
          setService(serviceData);


          const ratingsRef = collection(db, "ratings");
          const ratingsQuery = query(
            ratingsRef,
            where("serviceId", "==", id),
            orderBy("createdAt", "desc"),
          );
          const ratingsSnap = await getDocs(ratingsQuery);
          setIndividualRatings(
            ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          );


          const history = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
          
   
          const filteredHistory = history.filter((itemId) => itemId !== id);
          const newHistory = [id, ...filteredHistory];
          
 
          localStorage.setItem("recentlyViewed", JSON.stringify(newHistory.slice(0, 5)));

   
          const historyToFetch = newHistory.filter((itemId) => itemId !== id).slice(0, 3);

          if (historyToFetch.length > 0) {
            const similarQuery = query(
              collection(db, "services"),
              where(documentId(), "in", historyToFetch) 
            );
            const similarSnap = await getDocs(similarQuery);
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
                
                return {
                  ...simService,
                  rating: parseFloat(average),
                  ratingCount: count,
                };
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
        console.error("خطأ في جلب الخدمة:", err);
        setError("حدث خطأ في جلب بيانات الخدمة.");
      }
      setLoading(false);
    };
    fetchServiceAndRatings();
    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
      setAverageRating(data);
    });
    return () => {
      unsubscribeRating();
    };
  }, [id]); 

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
    if (userRole !== "customer") {
      setBookingError("فقط العملاء يمكنهم الإضافة للسلة.");
      setBookingLoading(false);
      return;
    }

    const itemToAdd = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      imageUrl: service.imageUrl,
      quantity: 1,
    };

    addToCart(itemToAdd);
    setBookingLoading(false);
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (cartItem) {
      updateCartItemQuantity(cartItem.cartId, newQuantity);
    }
  };

  if (loading) {
    return (
      <h1 className="text-center text-2xl p-10 text-second-text">
        جاري تحميل الخدمة...
      </h1>
    );
  }
  if (error) {
    return <h1 className="text-center text-2xl p-10 text-red-400">{error}</h1>;
  }
  if (!service) {
    return null;
  }

  return (
    <div className="bg-main-bg min-h-screen py-10 text-second-text">
      <div className="container mx-auto p-6 max-w-4xl space-y-12">
        <section>
          <h1 className="text-4xl font-extrabold text-second-text mb-1">
            {service.name}
          </h1>

          <div className="flex items-center space-x-2 space-x-reverse mb-3">
            <StarsReadOnly rating={averageRating.average} size={24} />
            <span className="text-2xl font-bold text-main-accent">
              {averageRating.average}
            </span>
            <span className="text-lg text-second-text">({averageRating.count} تقييم)</span>
          </div>
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-96 object-cover rounded-xl shadow-lg mb-6"
          />
          <div className="p-4 rounded-xl mb-6 text-center font-bold text-second-text">
            <p className="text-3xl">السعر: {service.price} ريال / الليلة</p>
          </div>
          <h3 className="text-2xl font-bold text-second-text mt-6 mb-3 border-b border-second-text/20 pb-2">
            تفاصيل الخدمة
          </h3>
          <p className="text-second-text text-lg whitespace-pre-wrap">
            {service.description || "لا يوجد وصف متوفر حالياً."}
          </p>
        </section>

        <section id="booking-section" className="p-6">
          {bookingError && (
            <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">
              {bookingError}
            </p>
          )}

          <div className="flex flex-col items-center">
            {isItemInCart ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                  className="bg-second-bg text-main-text font-black text-2xl w-12 h-12 rounded-full hover:bg-gray-300 transition flex items-center justify-center"
                >
                  <Minus size={20} />
                </button>
                <span className="text-3xl font-bold w-16 text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                  className="bg-second-bg text-main-text font-black text-2xl w-12 h-12 rounded-full hover:bg-gray-300 transition flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitialAddToCart}
                className="w-full max-w-xs bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300 disabled:bg-gray-500"
                disabled={bookingLoading}
              >
                {bookingLoading ? "جاري الإضافة..." : "أضف إلى السلة"}
              </button>
            )}

            {isItemInCart && (
              <Link to="/cart" className="block text-center mt-4 text-main-accent hover:underline">
                الذهاب للسلة
              </Link>
            )}
          </div>
        </section>

        <hr className="border-t-2 border-second-text/20" />

        {similarServices.length > 0 && (
          <section>

            <h3 className="text-3xl font-extrabold text-second-text mb-6">
              خدمات زرتها مؤخراً
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {similarServices.map((simService) => (
                <ServiceCard
                  key={simService.id}
                  service={simService} 
                  userRole={userRole}
                />
              ))}
            </div>
          </section>
        )}

        <hr className="border-t-2 border-second-text/20" />

        <section>
          <h3 className="text-3xl font-extrabold text-second-text mb-6">
            آراء العملاء ({averageRating.count})
          </h3>
          <div className="space-y-6">
            {individualRatings.length > 0 ? (
              individualRatings.map((rating) => (
                <div
                  key={rating.id}
                  className="border-b border-second-text/20 py-4 last:border-b-0"
                >
                  <div className="flex justify-between">
                    <StarsReadOnly rating={rating.rating} size={18} />
                    <p className="text-sm text-second-text/70">
                      {rating.createdAt
                        ? new Date(
                          rating.createdAt.toDate(),
                        ).toLocaleDateString("ar-SA")
                        : "..."}
                    </p>
                  </div>
                  <p className="italic text-lg my-2 text-second-text">
                    "{rating.comment}"
                  </p>
                  <p className="text-sm text-second-text/80 font-medium">
                    - {rating.userName || "عميل"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-second-text/70 text-center py-5">
                كن أول من يقيّم هذه الخدمة!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ServiceDetailPage;