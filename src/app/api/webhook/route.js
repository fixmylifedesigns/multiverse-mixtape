import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use App Password from Google Account
  },
});

export const POST = async (request) => {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const checkoutSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items", "customer_details"],
        }
      );

      const items = checkoutSession.line_items.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        price: (item.amount_total / 100).toFixed(2),
      }));

      // Send confirmation email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: checkoutSession.customer_details.email,
        subject: "Order Confirmation - Multiverse Mixtape",
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order Number: ${session.payment_intent}</p>
          <p>Order Date: ${new Date(
            session.created * 1000
          ).toLocaleDateString()}</p>
          
          <h2>Order Details:</h2>
          <ul>
            ${items
              .map(
                (item) => `
              <li>${item.name} x ${item.quantity} - $${item.price}</li>
            `
              )
              .join("")}
          </ul>
          
          <p>Total: $${(checkoutSession.amount_total / 100).toFixed(2)}</p>
          
          <h2>Shipping Details:</h2>
          <p>${checkoutSession.shipping_details.name}</p>
          <p>${checkoutSession.shipping.address.line1}</p>
          ${
            checkoutSession.shipping.address.line2
              ? `<p>${checkoutSession.shipping.address.line2}</p>`
              : ""
          }
          <p>${checkoutSession.shipping.address.city}, ${
          checkoutSession.shipping.address.state
        } ${checkoutSession.shipping.address.postal_code}</p>
          <p>${checkoutSession.shipping.address.country}</p>
          
          <p>We'll send you another email when your order ships!</p>
          
          <p>Best regards,<br>Multiverse Mixtape Team</p>
        `,
      });

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
};

// New Next.js 14.2+ way to disable body parsing
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
