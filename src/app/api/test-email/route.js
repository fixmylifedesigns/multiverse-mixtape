// src/app/api/test-email/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function GET() {
  try {
    const testOrder = {
      orderNumber:
        "MM-" + Math.random().toString(36).substring(7).toUpperCase(),
      items: [
        { name: "City Pop T-Shirt", quantity: 1, price: "29.99" },
        { name: "Retro Wave Hoodie", quantity: 2, price: "59.99" },
      ],
      total: 149.97,
      shipping: {
        name: "John Doe",
        address: {
          line1: "123 Main St",
          city: "Los Angeles",
          state: "CA",
          postal_code: "90001",
          country: "US",
        },
      },
    };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Your Multiverse Mixtape order has been confirmed!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; line-height: 1.6; color: #1a1a1a; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #611f69; color: white; padding: 20px; border-radius: 4px 4px 0 0; }
              .content { background: #ffffff; padding: 20px; border: 1px solid #e1e1e1; }
              .order-info { background: #f8f8f8; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .item { border-bottom: 1px solid #e1e1e1; padding: 10px 0; }
              .total { font-weight: bold; padding: 15px 0; border-top: 2px solid #e1e1e1; }
              .button { background: #611f69; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin:0;">Order Confirmed! 🎉</h1>
              </div>
              
              <div class="content">
                <p>Hey there,</p>
                <p>Thanks for shopping with Multiverse Mixtape! We're getting your order ready to be shipped.</p>
                
                <div class="order-info">
                  <h2 style="margin-top:0;">Order Details</h2>
                  <p><strong>Order Number:</strong> ${testOrder.orderNumber}</p>
                  <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                  
                  ${testOrder.items
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
                    <p style="margin:0;">Total: $${testOrder.total}</p>
                  </div>
                </div>
                
                <div class="order-info">
                  <h2 style="margin-top:0;">Shipping Information</h2>
                  <p style="margin:0;">
                    ${testOrder.shipping.name}<br>
                    ${testOrder.shipping.address.line1}<br>
                    ${testOrder.shipping.address.city}, ${
        testOrder.shipping.address.state
      } ${testOrder.shipping.address.postal_code}<br>
                    ${testOrder.shipping.address.country}
                  </p>
                </div>
                
                <a href="https://multiversemixtape.com/orders/${
                  testOrder.orderNumber
                }" class="button">View Order Status</a>
                
                <p>Questions? Check out our <a href="https://multiversemixtape.com/faq" style="color: #611f69;">FAQ</a> or reply to this email.</p>
              </div>
              
              <div class="footer">
                <p>Multiverse Mixtape | Los Angeles, CA</p>
                <p style="color: #999; font-size: 0.8em;">This is a test email from your Multiverse Mixtape development environment.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
