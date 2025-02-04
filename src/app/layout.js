import localFont from "next/font/local";
import Header from "@/components/nav";

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
  description:
    "Explore the MultiverseMixtape collection inspired by New Wave and City Pop culture. Shop our curated selection of music-inspired fashion and merchandise.",
  keywords: [
    "new wave",
    "city pop",
    "music fashion",
    "retro clothing",
    "japanese culture",
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
        <Header />
        {children}
      </body>
    </html>
  );
}
