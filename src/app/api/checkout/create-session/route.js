// src/app/api/checkout/create-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { items, shippingInfo } = await request.json();

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: [item.image],
        },
        unit_amount: item.price * 100, // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Format shipping address for Stripe
    const shippingAddress = {
      line1: shippingInfo.address,
      line2: shippingInfo.apartment || "",
      city: shippingInfo.city,
      state: shippingInfo.state,
      postal_code: shippingInfo.zipCode,
      country: shippingInfo.country,
    };

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      shipping_address_collection: {
        // Lock down allowed countries
        allowed_countries: ["US"], // Modify this array based on your shipping capabilities
      },
      // Pre-fill customer details
      customer_email: shippingInfo.email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 795, // $7.95 in cents
              currency: "usd",
            },
            display_name: "Standard Shipping",
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
      shipping_details: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        phone: shippingInfo.phone,
        address: shippingAddress,
      },
      // Prevent shipping address modification
      allow_shipping_address_changes: false,
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: "original_shipping_address",
          label: { type: "custom", custom: "Original Shipping Address" },
          type: "text",
          text: {
            maximum_length: 500,
          },
        },
      ],
      metadata: {
        // Store original shipping details in metadata for verification
        original_address: JSON.stringify(shippingAddress),
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_phone: shippingInfo.phone,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
