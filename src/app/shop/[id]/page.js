"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/printify/products/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);
        setSelectedVariant(data.variants[0]);

        // Set initial color and size if available
        const colorOptions = data.options.find((opt) => opt.name === "Colors");
        const sizeOptions = data.options.find((opt) => opt.name === "Sizes");
        if (colorOptions?.values.length)
          setSelectedColor(colorOptions.values[0].id);
        if (sizeOptions?.values.length)
          setSelectedSize(sizeOptions.values[0].id);

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  const handleVariantChange = () => {
    const newVariant = product.variants.find(
      (v) =>
        v.options.includes(parseInt(selectedColor)) &&
        v.options.includes(parseInt(selectedSize))
    );
    setSelectedVariant(newVariant || product.variants[0]);
  };

  useEffect(() => {
    if (selectedColor && selectedSize) handleVariantChange();
  }, [selectedColor, selectedSize]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );

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

        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="text-xl font-medium text-gray-900">
            ${selectedVariant?.price / 100}
          </div>

          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {product.options
                  .find((opt) => opt.name === "Colors")
                  ?.values.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select
                className="w-full border-gray-300 rounded-md shadow-sm"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {product.options
                  .find((opt) => opt.name === "Sizes")
                  ?.values.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {selectedVariant && (
            <button
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
              onClick={() => window.open(product.external, "_blank")}
            >
              Buy Now - ${selectedVariant.price / 100}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
