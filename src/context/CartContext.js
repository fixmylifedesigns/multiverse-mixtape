"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.variantId === action.payload.variantId
      );

      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case "REMOVE_FROM_CART": {
      const newItems = state.items.filter(
        (item) => item.variantId !== action.payload
      );
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) => {
          if (item.variantId === action.payload.variantId) {
            return { ...item, quantity: action.payload.quantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove items with quantity 0

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
      };
    }

    case "CLEAR_CART":
      return initialState;

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
      };

    default:
      return state;
  }
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const { items } = JSON.parse(savedCart);
        if (Array.isArray(items)) {
          dispatch({ type: "LOAD_CART", payload: items });
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state]);

  const addToCart = (product, variantId, selectedOptions) => {
    try {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        throw new Error("Variant not found");
      }

      dispatch({
        type: "ADD_TO_CART",
        payload: {
          id: product.id,
          title: product.title,
          variantId,
          price: variant.price,
          image: product.images[0]?.src,
          options: selectedOptions,
          variant: {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            grams: variant.grams,
            is_enabled: variant.is_enabled,
            options: variant.options,
          },
          blueprint_id: product.blueprint_id,
          print_provider_id: 99, // This is needed for Printify
        },
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const removeFromCart = (variantId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: variantId });
  };

  const updateQuantity = (variantId, quantity) => {
    if (quantity < 0) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const getCartForPrintify = () => {
    return state.items.map((item) => {
      // If SKU is available, return SKU-based line item
      if (item.variant?.sku) {
        return {
          sku: item.variant.sku,
          quantity: item.quantity,
        };
      }

      // If print_provider_id and blueprint_id are available, return that format
      if (item.print_provider_id && item.blueprint_id) {
        return {
          print_provider_id: item.print_provider_id,
          blueprint_id: item.blueprint_id,
          variant_id: parseInt(item.variantId),
          quantity: item.quantity,
        };
      }

      // Default to product_id and variant_id format
      return {
        product_id: item.id,
        variant_id: parseInt(item.variantId),
        quantity: item.quantity,
      };
    });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total: state.total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartForPrintify,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
