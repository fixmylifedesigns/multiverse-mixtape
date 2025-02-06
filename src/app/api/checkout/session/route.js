// src/app/api/checkout/session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id parameter" },
      { status: 400 }
    );
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "payment_intent"],
    });

    // Format the response data
    const orderData = {
      customer: {
        email: session.customer_details.email,
        name: session.customer_details.name,
      },
      orderAmount: session.amount_total,
      orderDate: new Date(session.created * 1000).toLocaleDateString(),
      paymentStatus: session.payment_status,
      items: session.line_items.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
      })),
      orderNumber: session.payment_intent.id,
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: "Error retrieving session details" },
      { status: 500 }
    );
  }
}
