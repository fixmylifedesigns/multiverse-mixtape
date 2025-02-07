"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "../app/globals.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
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
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="w-8 h-8 text-white" />
        </button>
      </div>
      <div className="text-center md:flex-1">
        <h1 className="text-3xl text-white font-bold mb-2 md:mb-0">
          The Multiverse Mixtape
        </h1>
        <p className="text-white">Music, Fashion, and Nostalgia</p>
      </div>
      <nav
        className={`nav md:flex ${
          menuOpen
            ? "flex flex-col absolute top-full left-0 w-full bg-pink-300"
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
          {/* <Link
            href="/shop"
            className="block text-white py-2 px-4 hover:bg-secondary-color rounded"
          >
            Shop
          </Link> */}
      </nav>
    </header>
  );
}
