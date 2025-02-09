"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Script from "next/script";

// Helper function for structured data
function generateProductSchema(product, selectedVariant, options) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description.replace(/<[^>]*>/g, ""),
    image: product.images[0]?.src,
    sku: selectedVariant?.sku,
    brand: {
      "@type": "Brand",
      name: "Multiverse Mixtape",
    },
    offers: {
      "@type": "Offer",
      price: selectedVariant?.price / 100,
      priceCurrency: "USD",
      availability: selectedVariant?.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Multiverse Mixtape",
      },
    },
  };
}

export default function ProductDetails({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [structuredData, setStructuredData] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/printify/products/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);

        // Initialize selected options with default values
        const initialOptions = {};
        data.options.forEach((option) => {
          initialOptions[option.name] = option.values[0]?.id;
        });
        setSelectedOptions(initialOptions);

        // Find the matching variant
        const defaultVariant = findMatchingVariant(
          data.variants,
          Object.values(initialOptions)
        );
        const variant = defaultVariant || data.variants[0];
        setSelectedVariant(variant);

        // Generate structured data
        setStructuredData(generateProductSchema(data, variant, initialOptions));

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  const findMatchingVariant = (variants, selectedOptionIds) => {
    return variants.find((variant) =>
      selectedOptionIds.every((optionId) =>
        variant.options.includes(parseInt(optionId))
      )
    );
  };

  const handleOptionChange = (optionName, optionId) => {
    const newOptions = { ...selectedOptions, [optionName]: optionId };
    setSelectedOptions(newOptions);

    if (product) {
      const matchingVariant = findMatchingVariant(
        product.variants,
        Object.values(newOptions)
      );
      setSelectedVariant(matchingVariant || product.variants[0]);

      // Update structured data with new variant
      setStructuredData(
        generateProductSchema(product, matchingVariant, newOptions)
      );
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      const optionsData = {};
      product.options.forEach((option) => {
        const selectedValue = option.values.find(
          (v) => v.id === parseInt(selectedOptions[option.name])
        );
        optionsData[option.name] = selectedValue.title;
      });

      addToCart(product, selectedVariant.id, optionsData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <>
      {structuredData && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <Link href="/shop" className="text-gray-500 hover:text-gray-700">
                Shop
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images Section */}
          <div className="space-y-4">
            <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
              {product.images?.[currentImageIndex]?.src && (
                <Image
                  src={product.images[currentImageIndex].src}
                  alt={`${product.title} - ${product.options
                    .map(
                      (option) =>
                        option.values.find(
                          (v) => v.id === parseInt(selectedOptions[option.name])
                        )?.title
                    )
                    .join(", ")}`}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full object-center"
                  priority={currentImageIndex === 0}
                />
              )}
            </div>

            <div
              className="grid grid-cols-4 gap-2"
              role="group"
              aria-label="Product image gallery"
            >
              {product.images.slice(0, 8).map((image, index) => (
                <button
                  key={index}
                  className={`relative h-24 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`View ${index + 1} of product gallery`}
                  aria-pressed={currentImageIndex === index}
                >
                  <Image
                    src={image.src}
                    alt={`${product.title} view ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-bold" id="product-title">
              {product.title}
            </h1>

            <div
              className="text-xl font-medium text-gray-900"
              aria-label="Product price"
            >
              ${selectedVariant?.price / 100}
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              {product.options.map((option) => (
                <div key={option.name}>
                  <label
                    htmlFor={`option-${option.name}`}
                    className="block text-sm font-medium mb-2"
                  >
                    {option.name}
                  </label>
                  <select
                    id={`option-${option.name}`}
                    className="w-full border-gray-300 rounded-md shadow-sm p-2"
                    value={selectedOptions[option.name]}
                    onChange={(e) =>
                      handleOptionChange(option.name, e.target.value)
                    }
                    aria-label={`Select ${option.name}`}
                  >
                    {option.values.map((value) => (
                      <option key={value.id} value={value.id}>
                        {value.title}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Add to Cart Button */}
            <button
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_available}
              aria-label={
                selectedVariant?.is_available ? "Add to Cart" : "Out of Stock"
              }
            >
              {selectedVariant?.is_available ? "Add to Cart" : "Out of Stock"}
            </button>

            {/* Product Description */}
            <div
              className="prose prose-sm mt-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Product Details */}
            {selectedVariant && (
              <div className="border-t pt-4 mt-4 space-y-2">
                <h2 className="text-lg font-semibold">Product Details</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">SKU:</span>{" "}
                  {selectedVariant.sku}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Weight:</span>{" "}
                  {selectedVariant.grams}g
                </p>
                {/* {selectedVariant.quantity < 10 && (
                  <p className="text-sm text-red-600 mt-2" role="alert">
                    Only {selectedVariant.quantity} left in stock!
                  </p>
                )} */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    Selected Options:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.options.map((option) => {
                      const selectedValue = option.values.find(
                        (v) => v.id === parseInt(selectedOptions[option.name])
                      );
                      return (
                        <li key={option.name}>
                          <span className="font-medium">{option.name}:</span>{" "}
                          {selectedValue?.title}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Shipping & Production Info */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">
                    Shipping & Production:
                  </h3>
                  <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                    <li>Production time: 2-5 business days</li>
                    <li>Shipping time varies by location</li>
                    <li>
                      Printed and shipped from our trusted print providers
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
