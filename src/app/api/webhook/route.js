// src/app/api/webhook/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function POST(req) {
  const headersList = headers();
  const sig = headersList.get("stripe-signature");

  try {
    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Log event for debugging
    console.log("Webhook event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(
        event.data.object.id,
        {
          expand: ["line_items", "customer_details"],
        }
      );

      // Log session for debugging
      console.log("Session retrieved:", session.id);

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: session.customer_details.email,
        subject: "Order Confirmation - Multiverse Mixtape",
        html: `...`, // Previous HTML template
      });

      console.log("Email sent successfully");
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
