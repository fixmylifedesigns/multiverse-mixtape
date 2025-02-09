// src/app/shop/[id]/page.js
import ProductDetails from "./ProductDetails";

export async function generateMetadata({ params }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/printify/products/${params.id}`
    );
    const product = await response.json();

    return {
      title: `${product.title} | Multiverse Mixtape Shop`,
      description: product.description
        .replace(/<[^>]*>/g, "")
        .substring(0, 160),
      openGraph: {
        title: product.title,
        description: product.description
          .replace(/<[^>]*>/g, "")
          .substring(0, 160),
        images: [product.images[0]?.src],
        type: "product",
        siteName: "Multiverse Mixtape",
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description: product.description
          .replace(/<[^>]*>/g, "")
          .substring(0, 160),
        images: [product.images[0]?.src],
      },
      keywords: [
        product.title,
        "City Pop",
        "Fashion",
        "Music Merchandise",
        "Japanese Culture",
        ...product.options.flatMap((option) =>
          option.values.map((value) => value.title)
        ),
      ],
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | Multiverse Mixtape Shop",
      description:
        "Shop our collection of music-inspired fashion and merchandise.",
    };
  }
}

export default function ProductPage({ params }) {
  return <ProductDetails params={params} />;
}
