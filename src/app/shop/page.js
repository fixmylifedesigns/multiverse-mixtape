"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

function ShopContent() {
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/printify/products", {
          cache: "no-store",
        });
        const data = await response.json();
        const visibleProducts = data.filter(
          (product) => product.visible === true
        );
        setProducts(visibleProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-medium" aria-current="page">
            Shop
          </li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold mb-4 text-center">
        Shop City Pop Threads
      </h1>
      <p className="text-lg text-gray-600 text-center mb-8">
        Discover our collection of City Pop-inspired fashion.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => router.push(`/shop/${product.id}`)}
            >
              <div className="relative h-64 w-full">
                <Image
                  src={product.images[0].src}
                  alt={product.title}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full object-center"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                <p className="text-lg font-medium text-gray-700 mb-4">
                  ${product.variants[0].price / 100}
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/shop/${product.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-lg text-gray-600">
            Loading products...
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => router.push(`/shop?page=${currentPage - 1}`)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => router.push(`/shop?page=${i + 1}`)}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push(`/shop?page=${currentPage + 1}`)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// **Step 2: Wrap `ShopContent` in a Suspense boundary**
export default function Shop() {
  return (
    <Suspense
      fallback={<div className="text-lg text-center py-8">Loading shop...</div>}
    >
      <ShopContent />
    </Suspense>
  );
}
