"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Initialize items as an empty array to prevent the reduce error
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Debug function to log current cart state
  const logCart = (message, cart) => {
    console.log(
      `CART ${message}:`,
      JSON.stringify(
        cart.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          uniqueKey: item.uniqueKey,
        }))
      )
    );
  };

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Make sure we set an array even if the localStorage data is invalid
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        setItems([]); // Reset to empty array on error
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items));
    } else {
      // Remove the cart item if empty to clean up localStorage
      localStorage.removeItem("cart");
    }
  }, [items]);

  // Add item to cart
  const addToCart = (product, variantId, optionsData) => {
    // Force single increment by using a non-functional update approach
    // for the case where an item already exists

    // First, generate the unique key
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return; // Safety check

    const uniqueKey = `${product.id}_${variant.id}`;

    // Check if item already exists
    const existingItemIndex = items.findIndex(
      (item) => item.uniqueKey === uniqueKey
    );

    if (existingItemIndex >= 0) {
      // Item already exists - create a new array with updated quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };

      // Set the new array directly
      setItems(updatedItems);
    } else {
      // Item is new - add it to the cart
      const newItem = {
        productId: product.id,
        variantId: variant.id,
        uniqueKey,
        title: product.title,
        price: variant.price,
        image: product.images[0]?.src,
        quantity: 1,
        options: optionsData || {},
      };

      setItems([...items, newItem]);
    }

    // Always open the cart when adding items
    setIsOpen(true);
  };

  // Remove item from cart - use uniqueKey instead of variantId
  const removeFromCart = (uniqueKey) => {
    setItems(items.filter((item) => item.uniqueKey !== uniqueKey));
  };

  // Update item quantity - use uniqueKey instead of variantId
  const updateQuantity = (uniqueKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(uniqueKey);
      return;
    }

    setItems(
      items.map((item) =>
        item.uniqueKey === uniqueKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate total price with safety check
  const total = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  // Format cart items for Printify API
  const getCartForPrintify = () => {
    // Ensure items is an array before mapping
    return Array.isArray(items)
      ? items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        }))
      : [];
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        total,
        getCartForPrintify,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}