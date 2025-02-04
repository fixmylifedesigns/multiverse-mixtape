import localFont from "next/font/local";
import "./globals.css";

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
  title: "Multiverse Mixtape",
  description: "New City Pop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="header">
          <div className="logo">CPT</div>
          <h1>The Multiverse Mixtape</h1>
          <p>Music, Fashion, and Nostalgia</p>
          <nav className="nav">
            <a href="#about">About</a>
            <a href="#artists">Artists</a>
            <a href="#playlist">Playlist</a>
            {/* <a href="#shop">Shop</a> */}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
