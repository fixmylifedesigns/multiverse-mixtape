"use client";
import { useState, useEffect } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import "../app/globals.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Get cart data and functions from context
  const { items, isOpen, setIsOpen } = useCart();

  // Calculate total item count, including quantities
  const totalItemCount = items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Track scroll position to determine when to switch to fixed positioning
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle cart open/closed
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header className="header flex flex-col md:flex-row items-center justify-between p-4 bg-primary-color border-b-4 border-orange-600">
        <div className="flex items-center w-full md:w-auto justify-between">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="MultiverseMixtape Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </Link>
          <div className="flex items-center md:hidden">
            {/* Cart icon for mobile */}
            <button 
              onClick={toggleCart}
              className="text-white p-2 mr-4 relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>
            
            {/* Hamburger menu for mobile */}
            <button 
              className="text-white" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
        
        <div className="text-center md:flex-1">
          <h1 className="text-3xl text-white font-bold mb-2 md:mb-0">
            The Multiverse Mixtape
          </h1>
          <p className="text-white">Music, Fashion, and Nostalgia</p>
        </div>
        
        <div className="flex items-center">
          <nav
            className={`nav md:flex ${
              menuOpen
                ? "flex flex-col absolute top-full left-0 w-full bg-pink-300 z-50"
                : "hidden"
            } md:relative md:w-auto md:flex-row md:gap-4`}
          >
            <Link
              href="/#about"
              className="block text-white py-2 px-4 hover:bg-secondary-color rounded"
            >
              About
            </Link>
            <Link
              href="/#artists"
              className="block text-white py-2 px-4 hover:bg-secondary-color rounded"
            >
              Artists
            </Link>
            <Link
              href="/#playlist"
              className="block text-white py-2 px-4 hover:bg-secondary-color rounded"
            >
              Playlist
            </Link>
            <Link
              href="/shop"
              className="block text-white py-2 px-4 hover:bg-secondary-color rounded"
            >
              Shop
            </Link>
          </nav>
          
          {/* Cart icon for desktop */}
          <button
            onClick={toggleCart}
            className="hidden md:block text-white p-2 ml-4 relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Fixed Cart Button that appears when scrolling - hide when cart is open */}
      {isScrolled && !isOpen && (
        <button
          onClick={toggleCart}
          className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </button>
      )}
    </>
  );
}