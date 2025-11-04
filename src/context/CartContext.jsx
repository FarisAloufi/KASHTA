import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. إنشاء السياق
const CartContext = createContext();

// 2. دالة لاستخدام السياق بسهولة
export function useCart() {
  return useContext(CartContext);
}

// 3. المزوّد (Provider) الذي سيحتوي على منطق السلة
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // 4. عند فتح التطبيق، قم بتحميل السلة من الـ LocalStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('kashta-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // 5. عند تغيير السلة، قم بحفظها في الـ LocalStorage
  useEffect(() => {
    localStorage.setItem('kashta-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 6. دالة إضافة منتج للسلة
  const addToCart = (item) => {
    setCartItems(prevItems => {
      // (إضافة ID فريد للسلة لسهولة الحذف لاحقاً)
      const newItem = { ...item, cartId: Date.now() };
      return [...prevItems, newItem];
    });
    alert('تمت إضافة الخدمة إلى السلة!');
  };

  // 7. دالة حذف منتج من السلة
  const removeFromCart = (cartId) => {
    setCartItems(prevItems => {
      return prevItems.filter(item => item.cartId !== cartId);
    });
  };

  // 8. دالة تفريغ السلة (بعد إتمام الطلب)
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}