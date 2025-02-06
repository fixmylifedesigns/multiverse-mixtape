import { NextResponse } from "next/server";

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;

export async function GET() {
  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Clean and filter products
    const cleanedProducts = data.data.map((product) => {
      // Get enabled variants and clean them
      const enabledVariants = product.variants
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

      // Collect used option IDs from enabled variants
      const usedOptionIds = new Set();
      enabledVariants.forEach((variant) => {
        variant.options.forEach((optionId) => {
          usedOptionIds.add(optionId);
        });
      });

      // Filter and clean options
      const filteredOptions = product.options.map((option) => ({
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

      // Return cleaned product
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        images: product.images.map((image) => ({
          src: image.src,
          variant_ids: image.variant_ids,
          position: image.position,
        })),
        options: filteredOptions,
        variants: enabledVariants,
        external: product.external,
        visible: product.visible,
        blueprint_id: product.blueprint_id,
      };
    });

    // Filter out products with no enabled variants
    const productsWithEnabledVariants = cleanedProducts.filter(
      (product) => product.variants.length > 0
    );

    return NextResponse.json(productsWithEnabledVariants);
  } catch (error) {
    console.error("Error fetching products from Printify:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
