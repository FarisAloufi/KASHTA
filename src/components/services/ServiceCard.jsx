import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Award, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';
import { translateText } from "../../utils/googleTranslate"; 

// --- Constants ---
const PLACEHOLDER_IMG = "https://placehold.co/600x400";

// --- Sub-Components ---
export const StarsReadOnly = ({ rating, size = 14 }) => {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          fill={index + 1 <= rating ? "#ffc107" : "none"}
          stroke={index + 1 <= rating ? "#ffc107" : "#3e2723"}
          size={size}
          className="transition-all"
        />
      ))}
    </div>
  );
};

// --- Main Component ---

function ServiceCard({ service, userRole, onDelete }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, updateCartItemQuantity, removeFromCart } = useCart();
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // --- 🆕 Translation Logic for Name ---
  const [displayName, setDisplayName] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");

  useEffect(() => {
    const resolveText = async (originalText, setter) => {
      if (!originalText) {
        setter("");
        return;
      }

      // 1. If it's an object {ar, en}, pick the correct language immediately
      if (typeof originalText === 'object') {
        const text = originalText[currentLang] || originalText.en || originalText.ar || "";
        setter(text);
        return;
      }

      // 2. If it's a string, try to translate if needed
      if (currentLang === 'en' && typeof originalText === 'string') {
        if (/[\u0600-\u06FF]/.test(originalText)) {
           try {
             const translated = await translateText(originalText, 'en');
             setter(translated);
           } catch (err) {
             setter(originalText);
           }
        } else {
           setter(originalText);
        }
      } else {
        setter(originalText);
      }
    };

    const nameRaw = service.packageName || service.name;
    resolveText(nameRaw, setDisplayName);
    resolveText(service.description, setDisplayDescription);

  }, [service, currentLang]);


  // Check if item is already in cart
  const cartItem = cartItems.find((item) => item.serviceId === service.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Determine if delete button should be visible
  const showDeleteButton = onDelete && (
    userRole === "admin" || 
    (userRole === "provider" && currentUser && service.providerId === currentUser.uid)
  );

  // --- Handlers ---

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(t('common.confirm_delete'))) {
      onDelete(service.id);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (userRole === 'admin' || userRole === 'provider') {
      alert(t('services.add_error_role'));
      return;
    }

    // Ensure we are passing the object (for later translation) or a safe string
    const nameObject = service.isPackage ? service.packageName : service.name;

    const itemToAdd = {
      serviceId: service.id,
      serviceName: nameObject, 
      servicePrice: Number(service.price),
      imageUrl: service.imageUrl,
      quantity: 1,
      type: service.isPackage ? 'package' : 'service',
      providerId: service.providerId 
    };

    addToCart(itemToAdd);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    if (userRole === 'admin' || userRole === 'provider') return;
    const idToUpdate = cartItem?.cartId || service.id; 
    updateCartItemQuantity(idToUpdate, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    if (userRole === 'admin' || userRole === 'provider') return;
    const idToUpdate = cartItem?.cartId || service.id;
    if (quantity > 1) {
      updateCartItemQuantity(idToUpdate, quantity - 1);
    } else {
      removeFromCart(idToUpdate);
    }
  };

  // Helper to safely get a string for the name fallback (prevents object crash)
  const safeName = () => {
    const raw = service.packageName || service.name;
    if (typeof raw === 'object') {
        return raw[currentLang] || raw.en || raw.ar || "";
    }
    return raw;
  }

  // --- Render ---

  return (
    <div className="group relative bg-second-bg text-main-text rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-main-bg max-w-sm mx-auto w-full flex flex-col">
      
      {showDeleteButton && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 left-2 z-10 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
          title={t('services.delete')}
        >
          <Trash2 size={16} />
        </button>
      )}

      <Link to={`/service/${service.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.imageUrl || PLACEHOLDER_IMG}
            alt={displayName || safeName()} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {service.rating >= 4.5 && (
            <div className="absolute top-2 right-2 bg-main-accent text-main-text px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Award size={12} />
              <span>{t('services.featured')}</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        
        <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-main-text line-clamp-1 group-hover:text-main-accent transition-colors">
              {/* ✅ FIX: Use displayName state, OR fallback to safeName helper. NEVER render service.name directly if it's an object. */}
              {displayName || safeName()} 
            </h3>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <StarsReadOnly rating={service.rating} size={14} />
          <span className="text-sm font-bold text-main-text">
            {service.rating ? Number(service.rating).toFixed(1) : 0}
          </span>
          <span className="text-xs text-main-text/60">
            ({service.ratingCount || 0})
          </span>
        </div>

        <p className="text-sm text-main-text/70 mb-4 line-clamp-2 h-10 leading-tight">
          {displayDescription || t('services.no_desc')}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-main-bg mt-auto">
          
          <div>
            <span className="text-xs text-main-text/60 block">{t('services.starts_from')}</span>
            <span className="text-xl font-extrabold text-main-text">
              {service.price} <span className="text-xs font-normal">{t('services.currency')}</span>
            </span>
          </div>

          {userRole !== 'admin' && userRole !== 'provider' && (
            quantity > 0 ? (
                <div className="flex items-center bg-main-text/10 rounded-xl p-1 shadow-inner">
                  <button onClick={handleIncrement} className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-main-accent transition shadow-sm">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                  <span className="font-black text-main-text w-8 text-center text-lg">{quantity}</span>
                  <button onClick={handleDecrement} className="w-8 h-8 flex items-center justify-center bg-main-text text-second-bg rounded-lg hover:bg-red-600 transition shadow-sm">
                    {quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} strokeWidth={3} />}
                  </button>
                </div>
            ) : (
                <button
                onClick={handleAddToCart}
                className="bg-main-text text-second-text px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-main-accent hover:text-main-text transition-all active:scale-95 flex items-center gap-2"
                >
                <ShoppingCart size={16} />
                {t('services.add_to_cart')}
                </button>
            )
          )}

        </div>
      </div>
    </div>
  );
}

export default ServiceCard;