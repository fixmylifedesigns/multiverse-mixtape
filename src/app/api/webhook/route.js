// src/app/api/webhook/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
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

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: checkoutSession.customer_details.email,
        subject: "Order Confirmation - Multiverse Mixtape",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #611f69; color: white; padding: 20px; border-radius: 4px 4px 0 0; text-align: center; }
                .content { background: #ffffff; padding: 20px; border: 1px solid #e1e1e1; }
                .order-info { background: #f8f8f8; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .item { border-bottom: 1px solid #e1e1e1; padding: 10px 0; }
                .total { font-weight: bold; padding: 15px 0; border-top: 2px solid #e1e1e1; }
                .shipping { background: #f0f7ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin:0;">Order Confirmed! 🎉</h1>
                </div>
                
                <div class="content">
                  <p>Hey ${checkoutSession.customer_details.name},</p>
                  <p>Thanks for shopping with Multiverse Mixtape! We're getting your order ready to be shipped.</p>
                  
                  <div class="order-info">
                    <h2 style="margin-top:0;">Order Details</h2>
                    <p><strong>Order Number:</strong> ${
                      session.payment_intent
                    }</p>
                    <p><strong>Order Date:</strong> ${new Date(
                      session.created * 1000
                    ).toLocaleDateString()}</p>
                    
                    ${items
                      .map(
                        (item) => `
                      <div class="item">
                        <p style="margin:0;">
                          <strong>${item.name}</strong><br>
                          Quantity: ${item.quantity}<br>
                          Price: $${item.price}
                        </p>
                      </div>
                    `
                      )
                      .join("")}
                    
                    <div class="total">
                      <p style="margin:0;">Total: $${(
                        checkoutSession.amount_total / 100
                      ).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div class="shipping">
                    <h2 style="margin-top:0;">Shipping Information</h2>
                    <p style="margin:0;">
                      ${checkoutSession.shipping_details.name}<br>
                      ${checkoutSession.shipping.address.line1}<br>
                      ${
                        checkoutSession.shipping.address.line2
                          ? `${checkoutSession.shipping.address.line2}<br>`
                          : ""
                      }
                      ${checkoutSession.shipping.address.city}, ${
          checkoutSession.shipping.address.state
        } ${checkoutSession.shipping.address.postal_code}<br>
                      ${checkoutSession.shipping.address.country}
                    </p>
                  </div>
                  
                  <p>We'll send you another email when your order ships!</p>
                </div>
                
                <div class="footer">
                  <p>Multiverse Mixtape | Los Angeles, CA</p>
                  <p>Questions? Reply to this email - we're here to help!</p>
                </div>
              </div>
            </body>
          </html>
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
