"use client";

import { useState } from "react";
import { X, Plus, Minus, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import ShippingForm from "./ShippingForm";

// Initialize Stripe outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function Cart() {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const {
    items,
    total,
    removeFromCart,
    updateQuantity,
    getCartForPrintify,
    isOpen,
    setIsOpen,
  } = useCart();

  const handleShippingSubmit = async (addressData) => {
    try {
      setIsProcessing(true);
      setError(null);

      // First get shipping rates
      console.log("Calculating shipping rates...");
      const shippingResponse = await fetch("/api/printify/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: getCartForPrintify(),
          address: addressData,
        }),
      });

      if (!shippingResponse.ok) {
        throw new Error("Failed to calculate shipping");
      }

      const shippingRates = await shippingResponse.json();
      console.log("Shipping rates:", shippingRates);

      // Format shipping data - make sure we have the rate
      const shipping = {
        rate: shippingRates.standard, // This matches the Printify response structure
        name: "Standard Shipping",
      };

      console.log("Formatted shipping data:", shipping);

      // Then create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
          shipping: shipping,
          address: addressData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      // Load Stripe and redirect to checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCheckout = () => {
    setShowShippingForm(true);
  };

  const handleBackToCart = () => {
    setShowShippingForm(false);
    setError(null);
  };

  // Don't render anything if cart is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="relative">
      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="p-4 h-full flex flex-col">
          {/* Cart Header */}
          <div className="flex justify-between items-center border-b pb-4">
            {showShippingForm ? (
              <div className="flex items-center">
                <button
                  onClick={handleBackToCart}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>
            ) : (
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {showShippingForm ? (
              <>
                <ShippingForm
                  onSubmit={handleShippingSubmit}
                  onBack={handleBackToCart}
                  isProcessing={isProcessing}
                />
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                  </div>
                )}
              </>
            ) : items.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.uniqueKey}
                    className="flex items-center space-x-4 border-b pb-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-gray-500">
                        ${(item.price / 100).toFixed(2)}
                      </p>
                      {/* Display selected options */}
                      {item.options &&
                        Object.entries(item.options).map(([key, value]) => (
                          <p key={key} className="text-sm text-gray-500">
                            {key}: {value}
                          </p>
                        ))}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.uniqueKey, item.quantity - 1)
                          }
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.uniqueKey, item.quantity + 1)
                          }
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.uniqueKey)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {!showShippingForm && items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${(total / 100).toFixed(2)}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                disabled={items.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              {/* Additional close button at the bottom for easier mobile access */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={() => setIsOpen(false)}
      />
    </div>
  );
}
