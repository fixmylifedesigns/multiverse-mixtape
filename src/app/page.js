"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div>
      <main className={styles.container}>
        {/* Multiverse Mixtape - Our Music */}
        <section className={styles.content} id="our-music">
          <h2>Our Music: The Multiverse Mixtape Sound</h2>
          <p>
            Inspired by the golden era of City Pop, we create music that pays
            homage to the past while embracing the future. Listen to our latest
            tracks on Spotify and experience the **Multiverse Mixtape** journey.
          </p>
          <div className={styles.spotifyEmbed}>
            <iframe
              // style="border-radius:12px"
              src="https://open.spotify.com/embed/artist/1hEy4eajOi9xpNBPAVGzuM?utm_source=generator"
              width="100%"
              height="152"
              frameBorder="0"
              allowfullscreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </section>

        {/* Introduction to Multiverse Mixtape */}
        <section className={styles.content} id="about">
          <h2>Multiverse Mixtape: A Love Letter to City Pop</h2>
          <p>
            Multiverse Mixtape started from a deep appreciation for **City
            Pop**, the genre that encapsulates the neon-soaked nostalgia of
            1980s Japan. What began as a passion for its smooth melodies and
            stylish aesthetic has evolved into a project that merges music,
            storytelling, and fashion.
          </p>
          <p>
            We blend classic City Pop influences with modern sounds, crafting a
            unique sonic experience that transcends time and space—just like a
            mixtape from a parallel universe.
          </p>
        </section>

        {/* Notable City Pop Artists */}
        <section className={styles.content} id="artists">
          <h2>City Pop Legends</h2>
          <ul className={styles.artistList}>
            <li>Tatsuro Yamashita</li>
            <li>Mariya Takeuchi</li>
            <li>Taeko Ohnuki</li>
            <li>Anri</li>
            <li>Miki Matsubara</li>
          </ul>
        </section>

        {/* Must-Listen City Pop Tracks */}
        <section className={styles.content} id="playlist">
          <h2>Essential City Pop Tracks</h2>
          <ol>
            <li>&quot;Plastic Love&quot; by Mariya Takeuchi</li>
            <li>&quot;Ride on Time&quot; by Tatsuro Yamashita</li>
            <li>&quot;Sweetest Music&quot; by Taeko Ohnuki</li>
            <li>&quot;Remember Summer Days&quot; by Anri</li>
            <li>&quot;Stay With Me&quot; by Miki Matsubara</li>
          </ol>
        </section>

        {/* City Pop Threads Shop */}
        <section className={styles.content} id="shop">
          <h2>City Pop Threads Shop</h2>
          <p>
            Elevate your wardrobe with fashion inspired by the sounds and
            aesthetics of 1980s City Pop. Our collection includes graphic tees,
            and accessories that capture the neon-lit nostalgia of Tokyo nights.
          </p>
          Shop Coming Soon
          <p>
            <Link href="/shop">Visit our shop</Link> to explore our latest
            collection!
          </p>
        </section>
      </main>
    </div>
  );
}
