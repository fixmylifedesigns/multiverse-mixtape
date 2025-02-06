// src/app/success/page.js
import { CheckCircle, Package, Mail } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getOrderData(sessionId) {
  try {
    // Retrieve the checkout session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "payment_intent"],
    });

    return {
      orderNumber: session.payment_intent.id,
      orderDate: new Date(session.created * 1000).toLocaleDateString(),
      orderAmount: session.amount_total,
      customer: {
        email: session.customer_details.email,
        name: session.customer_details.name,
      },
      items: session.line_items.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
      })),
    };
  } catch (error) {
    console.error("Error fetching order data:", error);
    return null;
  }
}

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const orderData = sessionId ? await getOrderData(sessionId) : null;

  if (!sessionId || !orderData) {
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
            Thank you for your purchase. We&apos;ll send you shipping updates
            via email.
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
