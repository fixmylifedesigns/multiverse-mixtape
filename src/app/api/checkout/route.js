// src/app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { items, shipping, address } = await request.json();

    // Get the host from headers
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Validate shipping rate
    if (!shipping?.rate) {
      throw new Error("Shipping rate is required");
    }

    // Create line items for Stripe with variant details
    const lineItems = items.map((item) => {
      // Create base product data
      const productData = {
        name: item.title,
        images: [item.image],
        metadata: {
          variantId: item.variantId,
          ...(item.options || {}),
        },
      };

      // Add variant details to product name if they exist
      if (item.options && Object.keys(item.options).length > 0) {
        const variantDetails = Object.entries(item.options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" | ");

        productData.name = `${item.title} (${variantDetails})`;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: productData,
          unit_amount: item.price,
        },
        quantity: item.quantity,
      };
    });

    // Convert shipping rate to cents and ensure it's a valid integer
    const shippingAmount = Math.round(Number(shipping.rate));

    if (isNaN(shippingAmount)) {
      throw new Error("Invalid shipping rate");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: shippingAmount,
              currency: "usd",
            },
            display_name: shipping.name || "Standard Shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
      customer_email: address.email,
      billing_address_collection: "required",
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Error creating checkout session" },
      { status: 500 }
    );
  }
}
