"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        setSelectedVariant(defaultVariant || data.variants[0]);

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

    // Find matching variant based on selected options
    if (product) {
      const matchingVariant = findMatchingVariant(
        product.variants,
        Object.values(newOptions)
      );
      setSelectedVariant(matchingVariant || product.variants[0]);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/shop"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
            {product.images?.[currentImageIndex]?.src && (
              <Image
                src={product.images[currentImageIndex].src}
                alt={product.title}
                layout="fill"
                objectFit="cover"
                className="w-full h-full object-center"
              />
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(0, 8).map((image, index) => (
              <button
                key={index}
                className={`relative h-24 rounded-lg overflow-hidden border-2 ${
                  currentImageIndex === index
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={image.src}
                  alt={`View ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <div className="text-xl font-medium text-gray-900">
            ${selectedVariant?.price / 100}
          </div>

          {/* Product Options */}
          <div className="space-y-4">
            {product.options.map((option) => (
              <div key={option.name}>
                <label className="block text-sm font-medium mb-2">
                  {option.name}
                </label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm p-2"
                  value={selectedOptions[option.name]}
                  onChange={(e) =>
                    handleOptionChange(option.name, e.target.value)
                  }
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            onClick={handleAddToCart}
            disabled={!selectedVariant?.is_available}
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
                <span className="font-medium">SKU:</span> {selectedVariant.sku}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Weight:</span>{" "}
                {selectedVariant.grams}g
              </p>
              {selectedVariant.quantity < 10 && (
                <p className="text-sm text-red-600 mt-2">
                  Only {selectedVariant.quantity} left in stock!
                </p>
              )}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Selected Options:</h3>
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
              {/* Print on Demand Details */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">
                  Print on Demand Details:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    <span className="font-medium">Blueprint ID:</span>{" "}
                    {product.blueprint_id}
                  </li>
                  <li>
                    <span className="font-medium">Variant ID:</span>{" "}
                    {selectedVariant.id}
                  </li>
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
                  <li>Printed and shipped from our trusted print providers</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
