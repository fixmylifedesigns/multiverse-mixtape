// src/lib/checkout.js
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export async function handleCheckout(cartItems, shippingInfo) {
  try {
    const stripe = await stripePromise;

    // Create checkout session
    const response = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cartItems,
        shippingInfo,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}
