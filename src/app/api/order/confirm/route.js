// src/app/api/order/confirm/route.js
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

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    // Retrieve the session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    });
    console.log(session)
    // Check if the payment was successful
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Check if confirmation email was already sent
    if (session.metadata?.email_confirmation_sent === "true") {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        message: "Confirmation email was already sent",
      });
    }

    // Format line items for email
    const itemsHtml = session.line_items.data
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${
            item.description || item.price.product.name
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${
            item.quantity
          }</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(
            item.amount_total / 100
          ).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: session.customer_details.email,
      subject: "Order Confirmation - Multiverse Mixtape",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Order Confirmation</h1>
          <p>Dear ${session.customer_details.name},</p>
          <p>Thank you for your order! We're excited to fulfill your Multiverse Mixtape merchandise.</p>
          
          <h2 style="color: #666;">Order Details</h2>
          <p><strong>Order Number:</strong> ${session.payment_intent}</p>
          <p><strong>Order Date:</strong> ${new Date(
            session.created * 1000
          ).toLocaleDateString()}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin: 20px 0; border-top: 2px solid #eee; padding-top: 20px;">
            <p><strong>Shipping Address:</strong><br />
            ${session.customer_details.name}<br />
            ${session.customer_details.address.line1}<br />
            ${
              session.customer_details.address.line2
                ? `${session.customer_details.address.line2}<br />`
                : ""
            }
            ${session.customer_details.address.city}, ${
        session.customer_details.address.state
      } ${session.customer_details.address.postal_code}<br />
            ${session.customer_details.address.country}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Total Amount:</strong> $${(
              session.amount_total / 100
            ).toFixed(2)}</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
            <p style="margin: 0;">If you have any questions about your order, please don't hesitate to contact us at ${
              process.env.EMAIL_USER
            }.</p>
          </div>
        </div>
      `,
    });

    // Update metadata in Stripe - using the correct structure
    const updatedSession = await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        email_confirmation_sent: "true",
        email_sent_at: new Date().toISOString(),
      },
    });

    if (!updatedSession.metadata.email_confirmation_sent) {
      throw new Error("Failed to update session metadata");
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order confirmation email sent",
    });
  } catch (error) {
    console.error("Order confirmation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order confirmation" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
