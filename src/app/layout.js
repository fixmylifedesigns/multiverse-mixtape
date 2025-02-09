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
    default: "MultiverseMixtape | New Wave Music Culture",
    template: "%s | MultiverseMixtape",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description:
    "Explore the MultiverseMixtape collection inspired by New Wave and City Pop culture. Shop our curated selection of music-inspired fashion and merchandise.",
  keywords: [
    "new wave",
    "city pop",
    "music fashion",
    "retro clothing",
    "japanese culture",
    "Multiverse Mixtape",
    "fixmylifenyc",
    "fixmylifeco",
    "fixmylife",
    "fixmylifekyoto",
    "fixmylifejapan",
    "Keiko Nishimura",
    "Spring Time",
    "Kiko Nakayama",
    "Found Love In Your Eyes",
  ],
  openGraph: {
    title: "MultiverseMixtape",
    description: "New Wave Music Culture & Fashion",
    url: "https://multiversemixtape.com",
    siteName: "MultiverseMixtape",
    locale: "en_US",
    type: "website",
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
    title: "MultiverseMixtape",
    description: "New Wave Music Culture & Fashion",
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
