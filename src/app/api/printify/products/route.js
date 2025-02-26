// src/app/api/printify/products/route.js
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import fs from "fs/promises";
import path from "path";

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const DISABLE_CACHE = process.env.DISABLE_PRODUCTS_CACHE === "true";
const CACHE_TAG = "printify-products";
const CACHE_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "products.json"
);
const CACHE_META_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "products-meta.json"
);
const CACHE_TTL = 86400; // 24 hours in seconds

function isProductPublished(product) {
  return (
    // Check if product is marked as visible (published)
    product.visible === true &&
    // Has at least one image
    product.images.length > 0 &&
    // Has at least one enabled and available variant
    product.variants.some(
      (variant) =>
        variant.is_enabled && variant.is_available && variant.quantity > 0
    )
  );
}

// Process and clean product data consistently
function processProductData(data) {
  // First filter for published products
  const publishedProducts = data.data.filter(isProductPublished);

  // Then clean and process the published products
  const cleanedProducts = publishedProducts.map((product) => {
    const enabledVariants = product.variants
      .filter(
        (variant) =>
          variant.is_enabled && variant.is_available && variant.quantity > 0
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
      // description: product.description,
      images: [
        product.images.map((image) => ({
          src: image.src,
          variant_ids: image.variant_ids,
          position: image.position,
        }))[0],
      ],
      // options: filteredOptions,
      variants: [enabledVariants[0]],
      // external: product.external,
      visible: product.visible,
      // blueprint_id: product.blueprint_id,
    };
  });

  // Filter one more time for products that still have variants after cleaning
  return cleanedProducts.filter((product) => product.variants.length > 0);
}

// Check if file cache exists and is valid
async function checkFileCache() {
  try {
    // Ensure directory exists
    await fs.mkdir(path.join(process.cwd(), "public", "data"), {
      recursive: true,
    });

    const metaData = JSON.parse(await fs.readFile(CACHE_META_PATH, "utf-8"));
    const now = Math.floor(Date.now() / 1000);

    // Check if cache is still valid
    if (metaData.timestamp && now - metaData.timestamp < CACHE_TTL) {
      return {
        isValid: true,
        data: JSON.parse(await fs.readFile(CACHE_FILE_PATH, "utf-8")),
      };
    }
    return { isValid: false };
  } catch (e) {
    return { isValid: false };
  }
}

// Write data to file cache
async function writeToFileCache(data) {
  try {
    await fs.mkdir(path.join(process.cwd(), "public", "data"), {
      recursive: true,
    });
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data));
    await fs.writeFile(
      CACHE_META_PATH,
      JSON.stringify({
        timestamp: Math.floor(Date.now() / 1000),
        count: data.length,
      })
    );
    console.log(`Cached ${data.length} products to file`);
  } catch (e) {
    console.error("Error writing to file cache:", e);
  }
}

export async function GET() {
  try {
    // Check if we should disable all caching
    if (DISABLE_CACHE) {
      try {
        revalidateTag(CACHE_TAG);
      } catch (error) {
        console.log("No cache to clear or cache already cleared");
      }
    }

    // First check if we have valid file cache
    if (!DISABLE_CACHE) {
      const fileCache = await checkFileCache();
      if (fileCache.isValid) {
        console.log("Serving products from file cache");
        return NextResponse.json(fileCache.data);
      }
    }

    // If no file cache or cache disabled, fetch from Printify API
    console.log("Fetching products from Printify API");
    const response = await fetch(
      `https://api.printify.com/v1/shops/${SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        ...(DISABLE_CACHE
          ? {
              cache: "no-store",
            }
          : {
              next: {
                tags: [CACHE_TAG],
                revalidate: 3600,
              },
            }),
      }
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.statusText}`);
    }

    const data = await response.json();
    const processedProducts = processProductData(data);

    // Write results to file cache for future requests
    if (!DISABLE_CACHE) {
      writeToFileCache(processedProducts).catch((err) =>
        console.error("Failed to write to file cache:", err)
      );
    }

    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error("Error fetching products from Printify:", error);

    // If API request fails, try to use file cache as fallback
    try {
      const fileCache = await checkFileCache();
      if (fileCache.isValid) {
        console.log("API fetch failed, using file cache as fallback");
        return NextResponse.json(fileCache.data);
      }
    } catch (fallbackError) {
      console.error("Fallback to file cache also failed:", fallbackError);
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
