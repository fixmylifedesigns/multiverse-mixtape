// src/app/api/printify/products/route.js
import { NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const DISABLE_CACHE = process.env.DISABLE_PRODUCTS_CACHE === 'true';
const CACHE_TAG = 'printify-products';

function isProductPublished(product) {
  return (
    // Check if product is marked as visible (published)
    product.visible === true && 
    // Has at least one image
    product.images.length > 0 &&
    // Has at least one enabled and available variant
    product.variants.some(variant => 
      variant.is_enabled && 
      variant.is_available && 
      variant.quantity > 0
    )
  );
}

export async function GET() {
  try {
    if (DISABLE_CACHE) {
      try {
        revalidateTag(CACHE_TAG);
      } catch (error) {
        console.log('No cache to clear or cache already cleared');
      }
    }

    const response = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        ...(DISABLE_CACHE ? {
          cache: 'no-store'
        } : {
          next: { 
            tags: [CACHE_TAG],
            revalidate: 3600
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.statusText}`);
    }

    const data = await response.json();

    // First filter for published products
    const publishedProducts = data.data.filter(isProductPublished);

    // Then clean and process the published products
    const cleanedProducts = publishedProducts.map((product) => {
      const enabledVariants = product.variants
        .filter((variant) => 
          variant.is_enabled && 
          variant.is_available && 
          variant.quantity > 0
        )
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

      const usedOptionIds = new Set();
      enabledVariants.forEach((variant) => {
        variant.options.forEach((optionId) => {
          usedOptionIds.add(optionId);
        });
      });

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

    // Filter one more time for products that still have variants after cleaning
    const productsWithVariants = cleanedProducts.filter(
      (product) => product.variants.length > 0
    );

    return NextResponse.json(productsWithVariants);
  } catch (error) {
    console.error("Error fetching products from Printify:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}