import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${id}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    const fullProduct = await response.json();

    // Filter to only enabled variants and clean up unnecessary fields
    const enabledVariants = fullProduct.variants
      .filter((variant) => variant.is_enabled)
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        title: variant.title,
        grams: variant.grams,
        is_enabled: variant.is_enabled,
        is_default: variant.is_default,
        is_available: variant.is_available,
        options: variant.options,
        quantity: variant.quantity,
      }));

    // Collect all option IDs used in enabled variants
    const usedOptionIds = new Set();
    enabledVariants.forEach((variant) => {
      variant.options.forEach((optionId) => {
        usedOptionIds.add(optionId);
      });
    });

    // Filter and clean the options array
    const filteredOptions = fullProduct.options.map((option) => ({
      name: option.name,
      type: option.type,
      values: option.values
        .filter((value) => usedOptionIds.has(value.id))
        .map((value) => ({
          id: value.id,
          title: value.title,
          ...(option.type === "color" && { colors: value.colors }),
        })),
    }));

    // Create cleaned product object with only necessary fields
    const cleanedProduct = {
      id: fullProduct.id,
      title: fullProduct.title,
      description: fullProduct.description,
      images: fullProduct.images.map((image) => ({
        src: image.src,
        variant_ids: image.variant_ids,
        position: image.position,
      })),
      options: filteredOptions,
      variants: enabledVariants,
      external: fullProduct.external,
      visible: fullProduct.visible,
      blueprint_id: fullProduct.blueprint_id,
    };

    return NextResponse.json(cleanedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
