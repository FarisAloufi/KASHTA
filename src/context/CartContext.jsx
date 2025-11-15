import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem("kashtaCart");
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse cart data", error);
      return [];
    }
  });

  
  useEffect(() => {
    localStorage.setItem("kashtaCart", JSON.stringify(cartItems));
  }, [cartItems]);

  
  const addToCart = (itemToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.serviceId === itemToAdd.serviceId,
      );

      if (existingItem) {
        
        return prevItems.map((item) =>
          item.serviceId === itemToAdd.serviceId
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item,
        );
      } else {
        
        return [...prevItems, { ...itemToAdd, cartId: Date.now().toString() }];
      }
    });
  };


  const updateCartItemQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) {
     
      removeFromCart(cartId);
      return;
    }
   
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartId !== cartId),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};