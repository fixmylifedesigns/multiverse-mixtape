"use client";

import { useEffect, useState } from "react";
import styles from "./shop.module.css";
import Image from "next/image";

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/printify/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Shop City Pop Threads</h1>
      <p>Discover our collection of City Pop-inspired fashion.</p>
      <div className={styles.productGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <Image src={product.images[0].src} alt={product.title} />
              <h3>{product.title}</h3>
              <p>${product.variants[0].price / 100}</p>
              <a
                href={product.external}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now
              </a>
            </div>
          ))
        ) : (
          <p>Loading products...</p>
        )}
      </div>
    </div>
  );
}
