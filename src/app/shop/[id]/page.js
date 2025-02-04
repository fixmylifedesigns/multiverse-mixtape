"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/printify/products/${params.id}`);
        const data = await response.json();
        setProduct(data);
        setSelectedVariant(data.variants[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
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
        <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
          <Image
            src={product.images[0].src}
            alt={product.title}
            layout="fill"
            objectFit="cover"
            className="w-full h-full object-center"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-xl font-medium text-gray-900 mb-4">
            ${selectedVariant?.price / 100}
          </p>
          <div className="prose prose-sm mb-6">
            <p>{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Variants</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-2 text-sm border rounded-md transition-colors
                    ${
                      selectedVariant?.id === variant.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-600"
                    }`}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          </div>

          <a
            href={product.external}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center"
          >
            Buy Now
          </a>
        </div>
      </div>
    </div>
  );
}
