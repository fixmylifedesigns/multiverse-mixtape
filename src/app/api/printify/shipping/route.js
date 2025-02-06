// src/app/api/printify/shipping/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { items, address } = await request.json();

    // Log the incoming request
    console.log("Received request:", { items, address });

    const requestBody = {
      line_items: items, // Keep the line items as is - they're already formatted correctly
      address_to: {
        first_name: address.first_name,
        last_name: address.last_name,
        email: address.email,
        phone: address.phone,
        country: address.country,
        region: address.region || "",
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        zip: address.zip,
      },
    };

    console.log("Sending to Printify:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders/shipping.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Printify shipping calculation error:", responseData);
      throw new Error(responseData.message || "Failed to calculate shipping");
    }

    console.log("Printify shipping response:", responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}
