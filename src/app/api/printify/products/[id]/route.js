import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import fs from "fs/promises";
import path from "path";

const DISABLE_CACHE = process.env.DISABLE_PRODUCTS_CACHE === "true";
const CACHE_TAG = "printify-product-detail";
const CACHE_DIRECTORY = path.join(process.cwd(), "public", "data", "products");
const CACHE_TTL = 86400; // 24 hours in seconds

// Check if product cache exists and is valid
async function checkProductCache(productId) {
  try {
    const filePath = path.join(CACHE_DIRECTORY, `${productId}.json`);
    const metaPath = path.join(CACHE_DIRECTORY, `${productId}-meta.json`);

    const metaData = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    const now = Math.floor(Date.now() / 1000);

    // Check if cache is still valid
    if (metaData.timestamp && now - metaData.timestamp < CACHE_TTL) {
      return {
        isValid: true,
        data: JSON.parse(await fs.readFile(filePath, "utf-8")),
      };
    }
    return { isValid: false };
  } catch (e) {
    return { isValid: false };
  }
}

// Write product data to file cache
async function writeProductToCache(productId, data) {
  try {
    await fs.mkdir(CACHE_DIRECTORY, { recursive: true });

    const filePath = path.join(CACHE_DIRECTORY, `${productId}.json`);
    const metaPath = path.join(CACHE_DIRECTORY, `${productId}-meta.json`);

    await fs.writeFile(filePath, JSON.stringify(data));
    await fs.writeFile(
      metaPath,
      JSON.stringify({
        timestamp: Math.floor(Date.now() / 1000),
        id: productId,
      })
    );

    console.log(`Cached product ${productId} to file`);
  } catch (e) {
    console.error(`Error writing product ${productId} to cache:`, e);
  }
}

// Process product data consistently
function processProductData(fullProduct) {
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
  return {
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
}

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Clear cache if DISABLE_CACHE is true
    if (DISABLE_CACHE) {
      try {
        revalidateTag(CACHE_TAG);
      } catch (error) {
        // Ignore errors if no cache exists
        console.log("No cache to clear or cache already cleared");
      }
    }

    // Check file cache first if caching is enabled
    if (!DISABLE_CACHE) {
      const fileCache = await checkProductCache(id);
      if (fileCache.isValid) {
        console.log(`Serving product ${id} from file cache`);
        return NextResponse.json(fileCache.data);
      }
    }

    // Fetch from API if no valid cache or caching disabled
    console.log(`Fetching product ${id} from Printify API`);
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${id}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
        },
        // Add cache configuration based on DISABLE_CACHE
        ...(DISABLE_CACHE
          ? {
              cache: "no-store",
            }
          : {
              next: {
                tags: [CACHE_TAG],
                revalidate: 3600, // Cache for 1 hour
              },
            }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    const fullProduct = await response.json();
    const cleanedProduct = processProductData(fullProduct);

    // Cache the result for future requests if caching is enabled
    if (!DISABLE_CACHE) {
      writeProductToCache(id, cleanedProduct).catch((err) =>
        console.error(`Failed to write product ${id} to file cache:`, err)
      );
    }

    return NextResponse.json(cleanedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);

    // Try to serve from cache as fallback if API request fails
    if (!DISABLE_CACHE) {
      try {
        const fileCache = await checkProductCache(id);
        if (fileCache.isValid) {
          console.log(
            `API fetch failed, serving product ${id} from file cache`
          );
          return NextResponse.json(fileCache.data);
        }
      } catch (fallbackError) {
        console.error(
          `Fallback to cache for product ${id} also failed:`,
          fallbackError
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
