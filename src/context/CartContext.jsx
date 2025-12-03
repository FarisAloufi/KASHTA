import React, { createContext, useContext, useState, useEffect } from "react";

// --- Configuration ---
const STORAGE_KEY = "kashtaCart";

// Create Context
const CartContext = createContext();

// Custom hook to access the Cart Context easily
export const useCart = () => useContext(CartContext);

// --- Provider Component ---

export const CartProvider = ({ children }) => {
  
  // 1. Initialize State (Lazy Loading)
  // We read from localStorage only once during the initial render.
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error parsing cart data from LocalStorage:", error);
      return [];
    }
  });

  // 2. Persistence Effect
  // Sync state changes to localStorage automatically.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Actions ---

  /**
   * Adds an item to the cart.
   * If the item already exists, it updates the quantity instead of adding a duplicate.
   */
  const addToCart = (itemToAdd) => {
    setCartItems((prevItems) => {
      const isItemExists = prevItems.some((item) => item.serviceId === itemToAdd.serviceId);

      if (isItemExists) {
        // Update quantity for existing item
        return prevItems.map((item) =>
          item.serviceId === itemToAdd.serviceId
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        );
      }
      
      // Add new item with a unique Cart ID (for UI rendering keys)
      return [...prevItems, { ...itemToAdd, cartId: Date.now().toString() }];
    });
  };

  /**
   * Updates the quantity of a specific cart item.
   * If quantity drops below 1, the item is removed.
   */
  const updateCartItemQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Removes a specific item from the cart by its Cart ID.
   */
  const removeFromCart = (cartId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartId !== cartId));
  };

  /**
   * Clears all items from the cart (e.g., after checkout).
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Context Values
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};