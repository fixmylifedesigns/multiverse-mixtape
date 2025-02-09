"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Mail } from "lucide-react";
import Link from "next/link";

function SuccessPage() {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details from Stripe
        const response = await fetch(
          `/api/checkout/session?session_id=${sessionId}`
        );
        if (!response.ok) throw new Error("Failed to fetch order details");
        const data = await response.json();
        setOrderData(data);

        // Send confirmation email if not already sent
        const confirmResponse = await fetch("/api/order/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!confirmResponse.ok) {
          console.error("Failed to send confirmation email");
        } else {
          const confirmData = await confirmResponse.json();
          if (confirmData.alreadySent) {
            console.log("Email was already sent for this order");
          } else {
            console.log("Email sent successfully");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchOrderDetails();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No order data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. We&apos;ve sent you a confirmation email
            with your order details.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Order number:</span>
            <span className="font-medium">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Order date:</span>
            <span className="font-medium">{orderData.orderDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total amount:</span>
            <span className="font-medium">
              ${(orderData.orderAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-4">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">What&apos;s Next?</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-500 mr-3" />
              <p>Confirmation email sent to {orderData.customer.email}</p>
            </div>
            <div className="flex items-center">
              <Package className="w-6 h-6 text-blue-500 mr-3" />
              <p>We&apos;ll notify you when your order ships</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// **Step 2: Wrap in Suspense**
export default function WrappedSuccessPage() {
  return (
    <Suspense
      fallback={<div className="text-lg">Loading order details...</div>}
    >
      <SuccessPage />
    </Suspense>
  );
}
