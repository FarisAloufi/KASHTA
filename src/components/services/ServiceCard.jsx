import React from "react";
import { Link } from "react-router-dom";
import { Star, Award, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "../../context/CartContext";

export const StarsReadOnly = ({ rating, size = 14 }) => {
  return (
    <div className="flex gap-0.5" dir="rtl">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={ratingValue}
            fill={ratingValue <= rating ? "#ffc107" : "none"}
            stroke={ratingValue <= rating ? "#ffc107" : "#3e2723"}
            size={size}
            className="transition-all"
          />
        );
      })}
    </div>
  );
};

function ServiceCard({ service, userRole, onDelete }) {
  const { cartItems, addToCart, updateCartItemQuantity, removeFromCart } = useCart();


  const cartItem = cartItems.find((item) => item.serviceId === service.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذه الخدمة؟")) {
      onDelete(service.id);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemToAdd = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: Number(service.price),
      imageUrl: service.imageUrl,
      quantity: 1,
      type: service.isPackage ? 'package' : 'service'
    };
    addToCart(itemToAdd);
  };


  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const idToUpdate = cartItem?.cartId || service.id;
    updateCartItemQuantity(idToUpdate, quantity + 1);
  };


  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const idToUpdate = cartItem?.cartId || service.id;

    if (quantity > 1) {
      updateCartItemQuantity(idToUpdate, quantity - 1);
    } else {
      removeFromCart(idToUpdate);
    }
  };

  return (
    <div className="group relative bg-second-bg text-main-text rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-main-text/10 max-w-sm mx-auto w-full flex flex-col">

      {userRole === "provider" && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 left-2 z-10 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
        >
          <Trash2 size={16} />
        </button>
      )}

      <Link to={`/service/${service.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.imageUrl || "https://placehold.co/600x400"}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {service.rating >= 4.5 && (
            <div className="absolute top-2 right-2 bg-main-accent text-main-text px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Award size={12} />
              <span>مميز</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-main-text line-clamp-1 group-hover:text-main-accent transition-colors">
            {service.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-2" dir="rtl">
          <StarsReadOnly rating={service.rating} size={14} />
          <span className="text-sm font-bold text-main-text">
            {service.rating || 0}
          </span>
          <span className="text-xs text-main-text/60">
            ({service.ratingCount || 0})
          </span>
        </div>

        <p className="text-sm text-main-text/70 mb-4 line-clamp-2 h-10 leading-tight">
          {service.description || "لا يوجد وصف متاح لهذه الخدمة."}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-main-text/10 mt-auto">
          <div>
            <span className="text-xs text-main-text/60 block">يبدأ من</span>
            <span className="text-xl font-extrabold text-main-text">
              {service.price} <span className="text-xs font-normal">ريال</span>
            </span>
          </div>


          {quantity > 0 ? (
            <div className="flex items-center bg-main-text/10 rounded-xl p-1 shadow-inner">
              <button
                onClick={handleIncrement}
                className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-main-accent transition shadow-sm"
              >
                <Plus size={16} strokeWidth={3} />
              </button>

              <span className="font-black text-main-text w-8 text-center text-lg">{quantity}</span>

              <button
                onClick={handleDecrement}
                className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-main-accent transition shadow-sm"
              >
                {quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} strokeWidth={3} />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="bg-main-text text-second-text px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-main-accent hover:text-main-text transition-all active:scale-95 flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              أضف للسلة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;