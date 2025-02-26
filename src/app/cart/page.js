// src/app/cart/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ShippingForm from "@/components/ShippingForm";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function Cart() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  
  // Use cart context instead of local state
  const { items, removeFromCart, updateQuantity, total, getCartForPrintify } = useCart();

  const handleProceedToCheckout = () => {
    setShowShippingForm(true);
  };
  
  const handleBackToCart = () => {
    setShowShippingForm(false);
    setError(null);
  };

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

  // Empty cart state
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-4">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            {items.map((item) => (
              <div
                key={item.uniqueKey}
                className="flex items-center p-6 border-b last:border-b-0"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  )}
                </div>

                {/* Product Details */}
                <div className="ml-6 flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    ${(item.price / 100).toFixed(2)}
                  </p>
                  
                  {/* Display selected options */}
                  {item.options &&
                    Object.entries(item.options).map(([key, value]) => (
                      <p key={key} className="text-sm text-gray-500">
                        {key}: {value}
                      </p>
                    ))}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center ml-6">
                  <button
                    onClick={() => updateQuantity(item.uniqueKey, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="mx-3 w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.uniqueKey, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.uniqueKey)}
                  className="ml-6 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="lg:col-span-4">
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>

              <div className="border-t pt-4 flex justify-between">
                <span className="text-lg font-medium">Total</span>
                <span className="text-lg font-bold">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {!showShippingForm ? (
              <button
                onClick={handleProceedToCheckout}
                disabled={isProcessing}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <button
                    onClick={handleBackToCart}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-medium text-gray-900">
                    Shipping Information
                  </h3>
                </div>
                <ShippingForm
                  onSubmit={handleShippingSubmit}
                  onBack={handleBackToCart}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}