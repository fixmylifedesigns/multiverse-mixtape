// src/app/layout.js
import localFont from "next/font/local";
import Script from "next/script";
import Header from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import Cart from "@/components/Cart";
import styles from "./page.module.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  metadataBase: new URL("https://multiversemixtape.com"),
  title: {
    default: "MultiverseMixtape | New Wave Music Culture & Fashion",
    template: "%s | MultiverseMixtape",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description:
    "Explore music-inspired fashion, vintage aesthetics, and unique posters influenced by New Wave, City Pop, and Japanese culture. Shop exclusive clothing, t-shirts, and collectibles.",
  keywords: [
    // Core Music & Fashion Keywords
    "new wave",
    "city pop",
    "synthwave fashion",
    "vaporwave fashion",
    "retro clothing",
    "music-inspired posters",
    "music-inspired clothing",
    "Japanese streetwear",
    "Japanese fashion",
    "Harajuku style",
    "Y2K aesthetic",
    "vintage music shirts",
    "retro-futurism",
    "80s fashion",
    "indie fashion",
    "underground music fashion",
    "music culture",
    "Japanese aesthetic",

    // Clothing & Merchandise
    "streetwear",
    "graphic tees",
    "aesthetic posters",
    "album cover art",
    "merchandise",
    "limited edition clothing",
    "minimalist fashion",
    "design t-shirts",
    "collectible posters",

    // AI & Digital Art (SEO Boost Without Overemphasis)
    "AI music",
    "AI fashion",
    "AI clothing",
    "AI posters",
    "AI art",
    "AI-generated designs",
    "digital art fashion",
    "AI-assisted design",
    "algorithmic artwork",

    // Brand & Niche
    "Multiverse Mixtape",
    "MultiverseMixtape",
    "the Multiverse Mixtape",
    "TheMultiverseMixtape",
    "fixmylifenyc",
    "fixmylifeco",
    "fixmylife",
    "fixmylifekyoto",
    "fixmylifejapan",
    "Keiko Nishimura",
    "Spring Time",
    "Kiko Nakayama",
    "Found Love In Your Eyes",
    "Ai City Pop",
    "Ai Music",
  ],
  openGraph: {
    title: "MultiverseMixtape | New Wave Culture & Fashion",
    description:
      "Discover music-inspired fashion, posters, and collectibles influenced by New Wave, City Pop, and Japanese aesthetics.",
    url: "https://multiversemixtape.com",
    siteName: "MultiverseMixtape",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://multiversemixtape.com/beautifuldays.jpg", // Ensure this exists
        width: 1200,
        height: 630,
        alt: "MultiverseMixtape - New Wave Culture & Fashion",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "MultiverseMixtape | Music Culture & Fashion",
    description:
      "Explore music-inspired fashion, retro aesthetics, and unique posters influenced by New Wave & Japanese culture.",
    images: ["https://multiversemixtape.com/logo.png"], // Ensure this exists
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
        <CartProvider>
          <Header />
          <Cart />
          {children}
        </CartProvider>
        <footer className={styles.footer}>
          <p>
            &copy; 2024 Multiverse Mixtape. Music and Fashion Inspired by
            Japanese City Pop.
          </p>
        </footer>
      </body>
    </html>
  );
}
